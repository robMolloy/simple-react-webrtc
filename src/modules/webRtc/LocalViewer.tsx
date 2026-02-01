import { useEffect, useRef, useState } from "react";

export const LocalViewer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("webrtc-demo");
    const channel = channelRef.current;

    channel.onmessage = async (event) => {
      const msg = event.data;

      if (msg.type === "offer") {
        const peerConnection = new RTCPeerConnection();

        // Remote stream
        const incomingStream = new MediaStream();
        setRemoteStream(incomingStream);

        peerConnection.ontrack = (event) => {
          event.streams[0]?.getTracks().forEach((t) => incomingStream.addTrack(t));
        };

        // Send ICE candidates as plain objects
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            channel.postMessage({
              type: "candidate",
              candidate: event.candidate.toJSON(),
            });
          }
        };

        // Set remote description and create answer
        await peerConnection.setRemoteDescription(msg.sdp);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        channel.postMessage({ type: "answer", sdp: answer });
        setPc(peerConnection);
      } else if (msg.type === "candidate" && pc) {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    };

    return () => channel.close();
  }, [pc]);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Local Viewer</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", background: "#000" }} />
    </div>
  );
};
