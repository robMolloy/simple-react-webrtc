import { useEffect, useRef, useState } from "react";

export const LocalStreamer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Setup BroadcastChannel
    channelRef.current = new BroadcastChannel("webrtc-demo");
    const channel = channelRef.current;

    channel.onmessage = async (event) => {
      const msg = event.data;

      if (msg.type === "answer" && pc) {
        await pc.setRemoteDescription(msg.sdp);
      } else if (msg.type === "candidate" && pc) {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    };

    return () => channel.close();
  }, [pc]);

  useEffect(() => {
    // Get local camera/mic
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    };
    init();
  }, []);

  const startStreaming = async () => {
    if (!localStream) return;

    const peerConnection = new RTCPeerConnection(); // no STUN/TURN needed locally

    // Add local tracks
    localStream.getTracks().forEach((t) => peerConnection.addTrack(t, localStream));

    // Send ICE candidates as plain objects
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current?.postMessage({
          type: "candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    channelRef.current?.postMessage({ type: "offer", sdp: offer });

    setPc(peerConnection);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Local Streamer</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", background: "#000" }} />
      <button onClick={startStreaming} style={{ marginTop: 10 }}>
        Start Streaming
      </button>
    </div>
  );
};
