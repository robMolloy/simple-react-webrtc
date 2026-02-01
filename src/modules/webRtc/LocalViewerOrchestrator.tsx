import { useEffect, useRef, useState } from "react";
import { LocalViewerSlave, type LocalViewerSlaveStatus } from "./LocalViewerSlave";

export const LocalViewerOrchestrator = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const offerRef = useRef<RTCSessionDescriptionInit | null>(null);
  const [remoteStream] = useState<MediaStream>(() => new MediaStream());

  const [slaveStatus, setSlaveStatus] = useState<LocalViewerSlaveStatus>({
    mode: "awaiting",
  });

  // Listen for potential streamer
  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo");
    channelRef.current = channel;

    // Ask for offer in case streamer started first
    channel.postMessage({ type: "request-offer" });

    channel.onmessage = async (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      // Offer received from streamer
      if (msg.type === "offer" && !pcRef.current) {
        setSlaveStatus({ mode: "offer-received" });
        offerRef.current = msg.sdp;
      }

      // ICE candidates while PC not created yet
      if (msg.type === "candidate") {
        const candidate = msg.candidate;
        if (!pcRef.current && candidate) {
          candidateQueueRef.current.push(candidate);
        } else if (pcRef.current && candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            candidateQueueRef.current.push(candidate);
          }
        }
      }
    };

    return () => {
      channel.close();
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  // Handle disconnect and reset to waiting state
  const handleDisconnect = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Clear remote stream tracks
    remoteStream.getTracks().forEach((track) => track.stop());

    // Reset state
    setSlaveStatus({ mode: "awaiting" });
    offerRef.current = null;
    candidateQueueRef.current = [];

    // Ask for new offer
    channelRef.current?.postMessage({ type: "request-offer" });
  };

  // Start streaming when user clicks button
  const handleStartStreamRequest = async () => {
    const offer = offerRef.current;
    if (!offer) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    // Handle remote tracks
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
    };

    // Send ICE candidates to streamer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateInit = event.candidate.toJSON();
        handleIceCandidate(candidateInit);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      handleConnectionStateChange(pc.connectionState);

      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        handleDisconnect();
      }
    };

    try {
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      handleAnswerCreated(answer);

      // Apply queued ICE candidates
      for (const c of candidateQueueRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {
          console.warn("Failed to add queued ICE candidate", c);
        }
      }
      candidateQueueRef.current = [];
      offerRef.current = null;

      setSlaveStatus({ mode: "streaming", data: { remoteStream } });
    } catch (err) {
      console.error("Failed to start stream:", err);
    }
  };

  // Callbacks
  const handleAnswerCreated = (answer: RTCSessionDescriptionInit) => {
    channelRef.current?.postMessage({ type: "answer", sdp: answer });
  };

  const handleIceCandidate = (candidate: RTCIceCandidateInit) => {
    channelRef.current?.postMessage({
      type: "candidate",
      candidate: candidate,
    });
  };

  const handleConnectionStateChange = (state: RTCPeerConnectionState) => {
    console.log("Connection state changed:", state);
  };

  return (
    <LocalViewerSlave
      status={slaveStatus}
      onAnswerCreated={handleAnswerCreated}
      onDisconnect={handleDisconnect}
      onIceCandidate={handleIceCandidate}
      onStartStreamRequest={handleStartStreamRequest}
      onConnectionStateChange={handleConnectionStateChange}
    />
  );
};
