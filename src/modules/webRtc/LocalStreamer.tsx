import { useEffect, useRef, useState } from "react";

export const LocalStreamer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const currentOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);

  // Get local camera/mic on mount
  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    };
    init();
  }, []);

  // Create BroadcastChannel on mount
  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo");
    channelRef.current = channel;

    channel.onmessage = async (event) => {
      const msg = event.data;

      // Late joiner requests current offer
      if (msg.type === "request-offer" && currentOfferRef.current) {
        channel.postMessage({ type: "offer", sdp: currentOfferRef.current });
      }

      // Viewer sends ICE candidate
      if (msg.type === "candidate") {
        const pc = pcRef.current;
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch {
            candidateQueueRef.current.push(msg.candidate);
          }
        } else {
          candidateQueueRef.current.push(msg.candidate);
        }
      }

      // Viewer sends answer
      if (msg.type === "answer" && pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(msg.sdp);
        } catch (err) {
          console.warn("Failed to set remote answer:", err);
        }
      }
    };

    return () => channel.close();
  }, []);

  const startStreaming = async () => {
    if (!localStream || streaming) return;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = peerConnection;

    // Add local tracks
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Send ICE candidates to viewers
    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) return;
      try {
        channelRef.current?.postMessage({
          type: "candidate",
          candidate: event.candidate.toJSON(),
        });
      } catch (err) {
        console.warn("Failed to send ICE candidate:", err);
      }
    };

    // Create and set local offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    currentOfferRef.current = offer;
    channelRef.current?.postMessage({ type: "offer", sdp: offer });

    // Apply any queued ICE candidates from viewers
    for (const c of candidateQueueRef.current) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        console.warn("Failed to add queued ICE candidate:", err);
      }
    }
    candidateQueueRef.current.length = 0;

    setStreaming(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const pc = pcRef.current;
      if (pc) {
        pc.onicecandidate = null;
        pc.close();
        pcRef.current = null;
      }
      channelRef.current?.close();
    };
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Local Streamer</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", background: "#000" }}
      />
      <button
        onClick={startStreaming}
        disabled={!localStream || streaming}
        style={{ marginTop: 10 }}
      >
        Start Streaming
      </button>
    </div>
  );
};
