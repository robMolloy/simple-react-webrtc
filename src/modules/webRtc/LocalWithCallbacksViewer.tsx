import { Button } from "@/components/ui/button";
import { useTriggerListener, type TTriggerData } from "@/lib/useTrigger";
import { useEffect, useRef, useState } from "react";

export const LocalWithCallbacksViewer = (p: {
  onAnswerCreated: (answer: RTCSessionDescriptionInit) => void;
  offer: RTCSessionDescriptionInit | null;
  stopStreamTriggerData: TTriggerData;
}) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [answerCreated, setAnswerCreated] = useState(false);

  useTriggerListener({
    triggerValue: p.stopStreamTriggerData,
    fn: () => {
      if (videoElementRef.current) videoElementRef.current.srcObject = null;

      peerConnectionRef.current?.close();
      const newPeerConnection = new RTCPeerConnection();
      peerConnectionRef.current = newPeerConnection;
      newPeerConnection.ontrack = (event) => {
        if (videoElementRef.current && event.streams[0])
          videoElementRef.current.srcObject = event.streams[0];
      };
      setAnswerCreated(false);
    },
  });

  useEffect(() => {
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    peerConnection.ontrack = (event) => {
      if (videoElementRef.current && event.streams[0])
        videoElementRef.current.srcObject = event.streams[0];
    };

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    };
  }, []);

  return (
    <div>
      <h2>Local With Callbacks Viewer</h2>
      <video ref={videoElementRef} autoPlay playsInline muted style={{ width: "400px" }} />
      <div>
        <Button
          onClick={async () => {
            if (!p.offer || !peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(p.offer);

            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            p.onAnswerCreated(answer);

            setAnswerCreated(true);
          }}
          disabled={!p.offer || answerCreated}
        >
          Create Answer from Offer
        </Button>
      </div>
    </div>
  );
};
