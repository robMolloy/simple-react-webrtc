import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { useTrigger } from "@/lib/useTrigger";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalWithCallbacksViewer } from "@/modules/webRtc/LocalWithCallbacksViewer";
import { useEffect, useRef, useState } from "react";

const useViewerWebRtcCommsAcrossTabs = (channelName: string) => {
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

  return { channelRef, offer, stopStreamTrigger, sendAnswer };
};

export default function Page() {
  const { offer, stopStreamTrigger, sendAnswer } = useViewerWebRtcCommsAcrossTabs("webrtc-demo2");
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local With Callbacks Viewer</H1>
        <LocalWithCallbacksViewer
          offer={offer}
          stopStreamTriggerData={stopStreamTrigger.data}
          onAnswerCreated={sendAnswer}
        />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
