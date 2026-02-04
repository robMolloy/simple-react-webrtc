import { Button } from "@/components/ui/button";
import type { TStreamerWebRtcCommsHandler } from "@/pages/local-with-callbacks-streamer.page";
import { useEffect, useRef, useState } from "react";

type TStreamingStatus = { success: false } | { success: true; stream: MediaStream };

const useStreamerWebRtc = (p: { commsHandler: TStreamerWebRtcCommsHandler }) => {
  const peerConnectionRef = useRef<RTCPeerConnection>(new RTCPeerConnection());
  const [streamingStatus, setStreamingStatus] = useState<TStreamingStatus>({ success: false });

  useEffect(() => {
    if (p.commsHandler.answer)
      peerConnectionRef.current.setRemoteDescription(p.commsHandler.answer);
  }, [p.commsHandler.answer]);

  const startStreaming = async () => {
    const peerConnection = peerConnectionRef.current;

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    setStreamingStatus({ success: true, stream: localStream });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
  };

  const sendOffer = () => {
    if (peerConnectionRef.current?.localDescription)
      p.commsHandler.sendOffer(peerConnectionRef.current.localDescription);
  };

  const stopStreaming = () => {
    p.commsHandler.sendStop();
    peerConnectionRef.current?.close();
    peerConnectionRef.current = new RTCPeerConnection();

    if (!streamingStatus.success) return;

    streamingStatus.stream.getTracks().forEach((track) => track.stop());
    setStreamingStatus({ success: false });
  };

  return { startStreaming, sendOffer, stopStreaming, streamingStatus };
};

export const LocalWithCallbacksStreamer = (p: { commsHandler: TStreamerWebRtcCommsHandler }) => {
  const videoElementRef = useRef<HTMLVideoElement>(null!);

  const streamerWebRtc = useStreamerWebRtc({ commsHandler: p.commsHandler });

  useEffect(() => {
    videoElementRef.current.srcObject = streamerWebRtc.streamingStatus.success
      ? streamerWebRtc.streamingStatus.stream
      : null;
  }, [streamerWebRtc.streamingStatus]);

  return (
    <div>
      <h2>Local With Callbacks Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <Button
          onClick={streamerWebRtc.startStreaming}
          disabled={streamerWebRtc.streamingStatus.success}
        >
          Start Streaming
        </Button>
        <Button
          onClick={streamerWebRtc.sendOffer}
          disabled={!streamerWebRtc.streamingStatus.success}
        >
          Send Offer to Viewer
        </Button>
        <Button
          onClick={streamerWebRtc.stopStreaming}
          variant="destructive"
          disabled={!streamerWebRtc.streamingStatus.success}
        >
          Stop Streaming
        </Button>
      </div>
    </div>
  );
};
