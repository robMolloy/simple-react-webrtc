import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const useStreamerWebRtc = (p: {
  handleSendOffer: (offer: RTCSessionDescriptionInit) => void;
  answer: RTCSessionDescriptionInit | null;
}) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [offerCreated, setOfferCreated] = useState(false);

  useEffect(() => {
    (async () => {
      if (p.answer && peerConnectionRef.current)
        await peerConnectionRef.current.setRemoteDescription(p.answer);
    })();
  }, [p.answer]);

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

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    setIsStreaming(true);
    setOfferCreated(true);
  };

  const sendOffer = () =>
    p.handleSendOffer({
      type: peerConnectionRef.current!.localDescription!.type,
      sdp: peerConnectionRef.current!.localDescription!.sdp,
    });

  const stopStreaming = () => {
    if (videoElementRef.current?.srcObject) {
      const stream = videoElementRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoElementRef.current.srcObject = null;
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    setIsStreaming(false);
    setOfferCreated(false);
  };

  return {
    videoElementRef,
    isStreaming,
    offerCreated,
    canSendOffer: offerCreated && !!peerConnectionRef.current?.localDescription,
    startStreaming,
    sendOffer,
    stopStreaming,
  };
};

export const LocalWithCallbacksStreamer = (p: {
  handleSendOffer: (offer: RTCSessionDescriptionInit) => void;
  handleSendStop: () => void;
  answer: RTCSessionDescriptionInit | null;
}) => {
  const { handleSendStop } = p;

  const { videoElementRef, isStreaming, canSendOffer, startStreaming, sendOffer, stopStreaming } =
    useStreamerWebRtc({
      handleSendOffer: p.handleSendOffer,
      answer: p.answer,
    });

  return (
    <div>
      <h2>Local With Callbacks Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <Button onClick={startStreaming} disabled={isStreaming}>
          Start Streaming
        </Button>
        <Button onClick={sendOffer} disabled={!canSendOffer}>
          Send Offer to Viewer
        </Button>
        <Button
          onClick={() => {
            stopStreaming();
            handleSendStop();
          }}
          variant="destructive"
          disabled={!isStreaming}
        >
          Stop Streaming
        </Button>
      </div>
    </div>
  );
};
