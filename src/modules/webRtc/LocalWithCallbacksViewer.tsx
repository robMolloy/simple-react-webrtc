import { Button } from "@/components/ui/button";
import { useTriggerListener } from "@/lib/useTrigger";
import type { TViewerWebRtcCommsHandler } from "@/pages/local-with-callbacks-viewer.page";
import { useEffect, useRef, useState } from "react";
import type { TStreamingStatus } from "./LocalWithCallbacksStreamer";

const useViewerWebRtc = (p: { commsHandler: TViewerWebRtcCommsHandler }) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [answerCreated, setAnswerCreated] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<TStreamingStatus>({ success: false });

  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection();
    pc.ontrack = (event) => {
      if (event.streams[0]) setStreamingStatus({ success: true, stream: event.streams[0] });
    };
    peerConnectionRef.current = pc;
    return pc;
  };

  useEffect(() => {
    initializePeerConnection();
    return () => peerConnectionRef.current?.close();
  }, []);

  useTriggerListener({
    triggerValue: p.commsHandler.stopStreamTrigger.data,
    fn: () => {
      peerConnectionRef.current?.close();
      initializePeerConnection();
      setAnswerCreated(false);
      setStreamingStatus({ success: false });
    },
  });

  const createAnswer = async () => {
    if (!p.commsHandler.offer || !peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(p.commsHandler.offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    p.commsHandler.sendAnswer(answer);
    setAnswerCreated(true);
  };

  return { streamingStatus, answerCreated, createAnswer };
};

export const LocalWithCallbacksViewer = (p: { commsHandler: TViewerWebRtcCommsHandler }) => {
  const videoElementRef = useRef<HTMLVideoElement>(null!);

  const viewerWebRtc = useViewerWebRtc({ commsHandler: p.commsHandler });

  useEffect(() => {
    videoElementRef.current.srcObject = viewerWebRtc.streamingStatus.success
      ? viewerWebRtc.streamingStatus.stream
      : null;
  }, [viewerWebRtc.streamingStatus]);

  return (
    <div>
      <h2>Local With Callbacks Viewer</h2>
      <video ref={videoElementRef} autoPlay playsInline muted style={{ width: "400px" }} />
      <div>
        <Button
          onClick={viewerWebRtc.createAnswer}
          disabled={!p.commsHandler.offer || viewerWebRtc.answerCreated}
        >
          Create Answer from Offer
        </Button>
      </div>
    </div>
  );
};
