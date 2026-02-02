import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export const LocalWithCallbacksViewer = (p: {
  onSendAnswer: (answer: RTCSessionDescriptionInit) => void;
  offer: RTCSessionDescriptionInit | null;
  stopped: boolean;
}) => {
  const { onSendAnswer, offer, stopped } = p;

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [answerCreated, setAnswerCreated] = useState(false);

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

  useEffect(() => {
    (() => {
      if (!stopped) return;

      if (videoElementRef.current) videoElementRef.current.srcObject = null;

      peerConnectionRef.current?.close();
      const newPeerConnection = new RTCPeerConnection();
      peerConnectionRef.current = newPeerConnection;
      newPeerConnection.ontrack = (event) => {
        if (videoElementRef.current && event.streams[0])
          videoElementRef.current.srcObject = event.streams[0];
      };
      setAnswerCreated(false);
    })();
  }, [stopped]);

  return (
    <div>
      <h2>Local With Callbacks Viewer</h2>
      <video ref={videoElementRef} autoPlay playsInline muted style={{ width: "400px" }} />
      <div>
        <Button
          onClick={async () => {
            if (!offer || !peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(offer);

            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            onSendAnswer(answer);

            setAnswerCreated(true);
          }}
          disabled={!offer || answerCreated}
        >
          Create Answer from Offer
        </Button>
      </div>
    </div>
  );
};
