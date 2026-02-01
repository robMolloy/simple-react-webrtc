import { useEffect, useRef } from "react";

export const SimpleStreamer = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const startStreaming = async () => {
      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = localStream;
      }

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Streamer ICE candidate:", event.candidate);
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log("Streamer offer:", offer);
    };

    startStreaming();

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    };
  }, []);

  return (
    <div>
      <h2>Simple Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
    </div>
  );
};
