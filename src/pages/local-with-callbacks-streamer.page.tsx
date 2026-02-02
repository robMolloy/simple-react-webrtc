import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalWithCallbacksStreamer } from "@/modules/webRtc/LocalWithCallbacksStreamer";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo2");
    channelRef.current = channel;

    channel.onmessage = async (event) => {
      if (event.data.type === "answer") setAnswer(event.data.answer);
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const handleSendOffer = (offer: RTCSessionDescriptionInit) => {
    channelRef.current?.postMessage({ type: "offer", offer });
  };

  const handleSendStop = () => {
    channelRef.current?.postMessage({ type: "stop" });
    setAnswer(null);
  };

  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local With Callbacks Streamer</H1>
        <LocalWithCallbacksStreamer
          handleSendOffer={handleSendOffer}
          handleSendStop={handleSendStop}
          answer={answer}
        />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
