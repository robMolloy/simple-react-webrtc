import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalOnlyStreamer } from "@/modules/webRtc/LocalOnlyStreamer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local Only Streamer</H1>
        <LocalOnlyStreamer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
