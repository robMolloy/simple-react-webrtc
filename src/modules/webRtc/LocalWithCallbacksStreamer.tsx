import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const useStreamerWebRtc = (p: {
  handleSendOffer: (offer: RTCSessionDescription) => void;
  handleSendStop: () => void;
  answer: RTCSessionDescriptionInit | null;
}) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<
    { success: false } | { success: true; stream: MediaStream }
  >({
    success: false,
  });

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

    setStreamingStatus({ success: true, stream: localStream });

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    return localStream;
  };

  const sendOffer = () => {
    if (!peerConnectionRef.current?.localDescription) return;

    p.handleSendOffer(peerConnectionRef.current.localDescription);
  };

  const stopStreaming = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    p.handleSendStop();

    if (!streamingStatus.success) return;

    streamingStatus.stream.getTracks().forEach((track) => track.stop());
    setStreamingStatus({ success: false });
  };

  return { startStreaming, sendOffer, stopStreaming, streamingStatus };
};

export const LocalWithCallbacksStreamer = (p: {
  handleSendOffer: (offer: RTCSessionDescriptionInit) => void;
  handleSendStop: () => void;
  answer: RTCSessionDescriptionInit | null;
}) => {
  const videoElementRef = useRef<HTMLVideoElement>(null!);

  const { startStreaming, streamingStatus, sendOffer, stopStreaming } = useStreamerWebRtc({
    handleSendOffer: p.handleSendOffer,
    handleSendStop: p.handleSendStop,
    answer: p.answer,
  });

  useEffect(() => {
    if (!videoElementRef.current) return;
    videoElementRef.current.srcObject = streamingStatus.success ? streamingStatus.stream : null;
  }, [streamingStatus]);
  return (
    <div>
      <h2>Local With Callbacks Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <Button onClick={startStreaming} disabled={streamingStatus.success}>
          Start Streaming
        </Button>
        <Button onClick={sendOffer} disabled={!streamingStatus.success}>
          Send Offer to Viewer
        </Button>
        <Button onClick={stopStreaming} variant="destructive" disabled={!streamingStatus.success}>
          Stop Streaming
        </Button>
      </div>
    </div>
  );
};
