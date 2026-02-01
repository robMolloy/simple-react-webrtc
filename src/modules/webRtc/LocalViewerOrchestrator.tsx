import { useEffect, useRef, useState } from "react";
import { LocalViewerSlave, type LocalViewerSlaveStatus } from "./LocalViewerSlave";

export const LocalViewerOrchestrator = () => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
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
      if (msg.type === "offer") {
        // Create peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        setSlaveStatus({
          mode: "offer-received",
          data: { offer: msg.sdp, peerConnection: peerConnection },
        });
      }

      // Stream ended - revert to awaiting
      if (msg.type === "stream-ended") {
        handleDisconnect();
      }
    };

    return () => {
      channel.close();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, []);

  // Callback handlers
  const handleAnswerCreated = (answer: RTCSessionDescriptionInit) => {
    channelRef.current?.postMessage({ type: "answer", sdp: answer });
  };

  const handleDisconnect = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current = new MediaStream();
    setSlaveStatus({ mode: "awaiting" });
    channelRef.current?.postMessage({ type: "request-offer" });
  };

  return (
    <LocalViewerSlave
      status={slaveStatus}
      onAnswerCreated={handleAnswerCreated}
      onDisconnect={handleDisconnect}
    />
  );
};
