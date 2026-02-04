import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const useStreamerWebRtc = (p: {
  handleSendOffer: (offer: RTCSessionDescriptionInit) => void;
  answer: RTCSessionDescriptionInit | null;
}) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

    streamRef.current = localStream;

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    return localStream;
  };

  const sendOffer = () =>
    p.handleSendOffer({
      type: peerConnectionRef.current!.localDescription!.type,
      sdp: peerConnectionRef.current!.localDescription!.sdp,
    });

  const stopStreaming = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  return { startStreaming, sendOffer, stopStreaming };
};

export const LocalWithCallbacksStreamer = (p: {
  handleSendOffer: (offer: RTCSessionDescriptionInit) => void;
  handleSendStop: () => void;
  answer: RTCSessionDescriptionInit | null;
}) => {
  const { handleSendStop } = p;
  const videoElementRef = useRef<HTMLVideoElement>(null!);
  const [isStreaming, setIsStreaming] = useState(false);

  const { startStreaming, sendOffer, stopStreaming } = useStreamerWebRtc({
    handleSendOffer: p.handleSendOffer,
    answer: p.answer,
  });

  const handleStartStreaming = async () => {
    const stream = await startStreaming();
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = stream;
    }
    setIsStreaming(true);
  };

  const handleStopStreaming = () => {
    stopStreaming();
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    handleSendStop();
    setIsStreaming(false);
  };

  return (
    <div>
      <h2>Local With Callbacks Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <Button onClick={handleStartStreaming} disabled={isStreaming}>
          Start Streaming
        </Button>
        <Button onClick={sendOffer} disabled={!isStreaming}>
          Send Offer to Viewer
        </Button>
        <Button
          onClick={handleStopStreaming}
          variant="destructive"
          disabled={!isStreaming}
        >
          Stop Streaming
        </Button>
      </div>
    </div>
  );
};
