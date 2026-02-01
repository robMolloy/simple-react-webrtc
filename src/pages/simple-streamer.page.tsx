import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { SimpleStreamer } from "@/modules/webRtc/SimpleStreamer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Simple Streamer</H1>
        <SimpleStreamer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
