import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { RemoteStreamer } from "@/modules/webRtc/RemoteStreamer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Remote Streamer</H1>
        <RemoteStreamer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
