import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalStreamer } from "@/modules/webRtc/LocalStreamer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Streamer</H1>
        <LocalStreamer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
