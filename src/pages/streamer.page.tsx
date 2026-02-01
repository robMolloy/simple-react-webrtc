import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { SimpleStreamer } from "@/modules/webRtc/Streamer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Streamer</H1>
        <SimpleStreamer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
