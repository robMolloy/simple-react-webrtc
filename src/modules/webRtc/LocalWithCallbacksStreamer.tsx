import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export const LocalWithCallbacksStreamer = (p: {
  handleSendOffer: (offer: RTCSessionDescriptionInit) => void;
  handleSendStop: () => void;
  answer: RTCSessionDescriptionInit | null;
}) => {
  const { handleSendOffer, handleSendStop, answer } = p;

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [offerCreated, setOfferCreated] = useState(false);

  useEffect(() => {
    (async () => {
      if (answer && peerConnectionRef.current)
        await peerConnectionRef.current.setRemoteDescription(answer);
    })();
  }, [answer]);

  return (
    <div>
      <h2>Local With Callbacks Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <Button
          onClick={async () => {
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

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            setIsStreaming(true);
            setOfferCreated(true);
          }}
          disabled={isStreaming}
        >
          Start Streaming
        </Button>
        <Button
          onClick={() => {
            handleSendOffer({
              type: peerConnectionRef.current!.localDescription!.type, // guaranteed due to disabled logic
              sdp: peerConnectionRef.current!.localDescription!.sdp, // guaranteed due to disabled logic
            });
          }}
          disabled={!offerCreated && !peerConnectionRef.current?.localDescription}
        >
          Send Offer to Viewer
        </Button>
        <Button
          onClick={() => {
            if (videoElementRef.current?.srcObject) {
              const stream = videoElementRef.current.srcObject as MediaStream;
              stream.getTracks().forEach((track) => track.stop());
              videoElementRef.current.srcObject = null;
            }

            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;

            handleSendStop();

            setIsStreaming(false);
            setOfferCreated(false);
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
