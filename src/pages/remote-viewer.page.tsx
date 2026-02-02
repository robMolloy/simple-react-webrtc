import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { RemoteViewer } from "@/modules/webRtc/RemoteViewer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Remote Viewer</H1>
        <RemoteViewer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
