import { useEffect, useRef, useState } from "react";

export const SimpleStreamer = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [offerCreated, setOfferCreated] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo2");
    channelRef.current = channel;

    // Listen for answer from viewer
    channel.onmessage = async (event) => {
      if (event.data.type === "answer" && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(event.data.answer);
        console.log("Streamer received answer");
      } else if (event.data.type === "ice-candidate" && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(event.data.candidate);
        console.log("Streamer received ICE candidate");
      }
    };

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
          // Send ICE candidate to viewer
          channel.postMessage({
            type: "ice-candidate",
            candidate: JSON.stringify(event.candidate),
            // candidate: event.candidate.toJSON(),
            sender: "streamer",
          });
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log("Streamer offer:", offer);
      setOfferCreated(true);
    };

    startStreaming();

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const sendOffer = () => {
    if (peerConnectionRef.current?.localDescription && channelRef.current) {
      console.log(`src/modules/webRtc/SimpleStreamer.tsx:${/*LL*/ 72}`, {});
      channelRef.current.postMessage({
        type: "offer",
        offer: {
          type: peerConnectionRef.current.localDescription.type,
          sdp: peerConnectionRef.current.localDescription.sdp,
        },
      });
      console.log("Offer sent to viewer");
    }
  };

  return (
    <div>
      <h2>Simple Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <button onClick={sendOffer} disabled={!offerCreated}>
          Send Offer to Viewer
        </button>
      </div>
    </div>
  );
};
