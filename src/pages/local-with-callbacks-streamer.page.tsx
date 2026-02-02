import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalWithCallbacksStreamer } from "@/modules/webRtc/LocalWithCallbacksStreamer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local With Callbacks Streamer</H1>
        <LocalWithCallbacksStreamer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
