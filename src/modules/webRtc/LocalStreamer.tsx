import { useEffect, useRef, useState } from "react";

export const LocalStreamer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const currentOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);

  // Initialize BroadcastChannel on mount
  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo");
    channelRef.current = channel;

    channel.onmessage = async (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "request-offer" && currentOfferRef.current) {
        channel.postMessage({ type: "offer", sdp: currentOfferRef.current });
      }

      if (msg.type === "candidate") {
        const pc = pcRef.current;
        const candidate = msg.candidate;
        if (pc && candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            candidateQueueRef.current.push(candidate);
          }
        } else if (candidate) {
          candidateQueueRef.current.push(candidate);
        }
      }

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

  // Update video srcObject when localStream changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = peerConnection;

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          channelRef.current?.postMessage({
            type: "candidate",
            candidate: event.candidate.toJSON(),
          });
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      currentOfferRef.current = offer;
      channelRef.current?.postMessage({ type: "offer", sdp: offer });

      // Apply queued ICE candidates
      for (const c of candidateQueueRef.current) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(c));
        } catch {
          console.warn("Failed to add queued ICE candidate:", c);
        }
      }
      candidateQueueRef.current.length = 0;

      setStreaming(true);
    } catch (err) {
      console.error("Failed to start streaming:", err);
    }
  };

  const hangUp = () => {
    pcRef.current?.close();
    pcRef.current = null;

    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setStreaming(false);
    currentOfferRef.current = null;
    candidateQueueRef.current.length = 0;

    // Notify viewers that the stream has ended
    channelRef.current?.postMessage({ type: "stream-ended" });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <h2>Local Streamer</h2>

      {/* Video is always in the DOM, hidden if not streaming */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          background: "#000",
          display: streaming ? "block" : "none",
          marginTop: 10,
        }}
      />

      {!streaming ? (
        <button onClick={startStreaming} style={{ marginTop: 10 }}>
          Start Streaming
        </button>
      ) : (
        <button onClick={hangUp} style={{ marginTop: 10 }}>
          Hang Up
        </button>
      )}
    </div>
  );
};
