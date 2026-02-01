import { useEffect, useRef } from "react";

export const SimpleViewer = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo2");
    channelRef.current = channel;

    const startViewing = async () => {
      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      peerConnection.ontrack = (event) => {
        if (videoElementRef.current && event.streams[0]) {
          videoElementRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Viewer ICE candidate:", event.candidate);
          // Send ICE candidate to streamer - extract properties manually
          channel.postMessage({
            type: "ice-candidate",
            candidate: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            },
            sender: "viewer",
          });
        }
      };

      // Listen for offer from streamer
      channel.onmessage = async (event) => {
        if (event.data.type === "offer" && peerConnectionRef.current) {
          console.log("Viewer received offer");
          await peerConnectionRef.current.setRemoteDescription(event.data.offer);

          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          channel.postMessage({
            type: "answer",
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
          });
          console.log("Viewer sent answer");
        } else if (
          event.data.type === "ice-candidate" &&
          event.data.sender === "streamer" &&
          peerConnectionRef.current
        ) {
          await peerConnectionRef.current.addIceCandidate(event.data.candidate);
          console.log("Viewer received ICE candidate");
        }
      };

      console.log("Viewer ready to receive offer");
    };

    startViewing();

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      channel.close();
      channelRef.current = null;
    };
  }, []);

  return (
    <div>
      <h2>Simple Viewer</h2>
      <video ref={videoElementRef} autoPlay playsInline style={{ width: "400px" }} />
    </div>
  );
};
