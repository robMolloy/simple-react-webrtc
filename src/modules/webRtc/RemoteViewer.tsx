import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export const RemoteViewer = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [offerReceived, setOfferReceived] = useState(false);
  const [answerCreated, setAnswerCreated] = useState(false);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo2");
    channelRef.current = channel;

    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    peerConnection.ontrack = (event) => {
      if (videoElementRef.current && event.streams[0]) {
        videoElementRef.current.srcObject = event.streams[0];
      }
    };

    channel.onmessage = (event) => {
      if (event.data.type === "offer") {
        pendingOfferRef.current = event.data.offer;
        setOfferReceived(true);
      } else if (event.data.type === "stop") {
        // Handle stream stop
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = null;
        }
        peerConnectionRef.current?.close();
        const newPeerConnection = new RTCPeerConnection();
        peerConnectionRef.current = newPeerConnection;
        newPeerConnection.ontrack = (event) => {
          if (videoElementRef.current && event.streams[0]) {
            videoElementRef.current.srcObject = event.streams[0];
          }
        };
        setOfferReceived(false);
        setAnswerCreated(false);
        pendingOfferRef.current = null;
      }
    };

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const createAnswerFromOffer = async () => {
    if (pendingOfferRef.current && peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(pendingOfferRef.current);

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setRemoteDescription(answer);

      channelRef.current?.postMessage({ type: "answer", answer });

      setAnswerCreated(true);
    }
  };

  return (
    <div>
      <h2>Remote Viewer</h2>
      <video ref={videoElementRef} autoPlay playsInline muted style={{ width: "400px" }} />
      <div>
        <Button onClick={createAnswerFromOffer} disabled={!offerReceived || answerCreated}>
          Create Answer from Offer
        </Button>
      </div>
    </div>
  );
};
