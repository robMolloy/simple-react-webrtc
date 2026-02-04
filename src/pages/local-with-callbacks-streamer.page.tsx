import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalWithCallbacksStreamer } from "@/modules/webRtc/LocalWithCallbacksStreamer";
import { useEffect, useRef, useState } from "react";

export type TStreamerWebRtcCommsHandler = {
  sendOffer: (offer: RTCSessionDescriptionInit) => void;
  sendStop: () => void;
  answer: RTCSessionDescriptionInit | null;
};

const useStreamerWebRtcCommsAcrossTabs = (channelName: string) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    channel.onmessage = async (event) => {
      if (event.data.type === "answer") setAnswer(event.data.answer);
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [channelName]);

  const sendOffer = (offer: RTCSessionDescriptionInit) => {
    channelRef.current?.postMessage({
      type: "offer",
      offer: { type: offer.type, sdp: offer.sdp },
    });
  };

  const sendStop = () => {
    channelRef.current?.postMessage({ type: "stop" });
    setAnswer(null);
  };

  return { answer, sendOffer, sendStop } as TStreamerWebRtcCommsHandler;
};

export default function Page() {
  const commsHandler = useStreamerWebRtcCommsAcrossTabs("webrtc-demo2");

  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local With Callbacks Streamer</H1>
        <LocalWithCallbacksStreamer commsHandler={commsHandler} />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
