import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export const RemoteStreamer = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [offerCreated, setOfferCreated] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo2");
    channelRef.current = channel;

    // Listen for answer from viewer
    channel.onmessage = async (event) => {
      if (event.data.type === "answer" && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(event.data.answer);
      }
    };

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const startStreaming = async () => {
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    const remoteStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (videoElementRef.current) {
      videoElementRef.current.srcObject = remoteStream;
    }

    remoteStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, remoteStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setRemoteDescription(offer);

    setIsStreaming(true);
    setOfferCreated(true);
  };

  const sendOffer = () => {
    if (peerConnectionRef.current?.remoteDescription && channelRef.current) {
      channelRef.current.postMessage({
        type: "offer",
        offer: {
          type: peerConnectionRef.current.remoteDescription.type,
          sdp: peerConnectionRef.current.remoteDescription.sdp,
        },
      });
    }
  };

  const stopStreaming = () => {
    // Stop all media tracks
    if (videoElementRef.current?.srcObject) {
      const stream = videoElementRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoElementRef.current.srcObject = null;
    }

    // Close peer connection
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    // Notify viewer that stream has stopped
    channelRef.current?.postMessage({ type: "stop" });

    setIsStreaming(false);
    setOfferCreated(false);
  };

  return (
    <div>
      <h2>Remote Only Streamer</h2>
      <video ref={videoElementRef} autoPlay muted playsInline style={{ width: "400px" }} />
      <div>
        <Button onClick={startStreaming} disabled={isStreaming}>
          Start Streaming
        </Button>
        <Button onClick={sendOffer} disabled={!offerCreated}>
          Send Offer to Viewer
        </Button>
        <Button onClick={stopStreaming} variant="destructive" disabled={!isStreaming}>
          Stop Streaming
        </Button>
      </div>
    </div>
  );
};
