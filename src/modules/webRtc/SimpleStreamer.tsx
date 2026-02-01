import { Button } from "@/components/ui/button";
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
      }

      if (event.data.type === "ice-candidate" && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(event.data.candidate);
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
      channelRef.current.postMessage({
        type: "offer",
        offer: {
          type: peerConnectionRef.current.localDescription.type,
          sdp: peerConnectionRef.current.localDescription.sdp,
        },
      });
    }
  };

  return (
    <div>
      <h2>Simple Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <Button onClick={sendOffer} disabled={!offerCreated}>
          Send Offer to Viewer
        </Button>
      </div>
    </div>
  );
};
