import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalWithCallbacksViewer } from "@/modules/webRtc/LocalWithCallbacksViewer";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo2");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data.type === "offer") {
        setOffer(event.data.offer);
        setStopped(false);
        return;
      }

      if (event.data.type === "stop") {
        setStopped(true);
        setOffer(null);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local With Callbacks Viewer</H1>
        <LocalWithCallbacksViewer
          offer={offer}
          stopped={stopped}
          onSendAnswer={(answer: RTCSessionDescriptionInit) =>
            channelRef.current?.postMessage({ type: "answer", answer })
          }
        />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
