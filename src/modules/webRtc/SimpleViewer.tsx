import { useEffect, useRef } from "react";

export const SimpleViewer = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
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
        }
      };

      // ⛔ Signaling intentionally omitted
      // You would normally:
      // 1. setRemoteDescription(offer)
      // 2. createAnswer()
      // 3. setLocalDescription(answer)

      console.log("Viewer ready to receive offer");
    };

    startViewing();

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    };
  }, []);

  return (
    <div>
      <h2>Simple Viewer</h2>
      <video ref={videoElementRef} autoPlay playsInline style={{ width: "400px" }} />
    </div>
  );
};
