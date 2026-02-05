import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { useTrigger } from "@/lib/useTrigger";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalWithCallbacksViewer } from "@/modules/webRtc/LocalWithCallbacksViewer";
import { useEffect, useRef, useState } from "react";

export type TViewerWebRtcCommsHandler = {
  offer: RTCSessionDescriptionInit | null;
  stopStreamTrigger: ReturnType<typeof useTrigger>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => void;
};
const useViewerWebRtcAcrossTabsCommsHandler = (channelName: string) => {
  const stopStreamTrigger = useTrigger();

  const channelRef = useRef<BroadcastChannel | null>(null);
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data.type === "offer") return setOffer(event.data.offer);

      if (event.data.type === "stop") {
        stopStreamTrigger.fire();
        setOffer(null);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const sendAnswer = (answer: RTCSessionDescriptionInit) =>
    channelRef.current?.postMessage({ type: "answer", answer });

  return { offer, stopStreamTrigger, sendAnswer } as TViewerWebRtcCommsHandler;
};

export default function Page() {
  const commsHandler = useViewerWebRtcAcrossTabsCommsHandler("webrtc-demo2");
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local With Callbacks Viewer</H1>
        <LocalWithCallbacksViewer commsHandler={commsHandler} />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
