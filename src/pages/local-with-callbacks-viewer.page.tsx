import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalWithCallbacksViewer } from "@/modules/webRtc/LocalWithCallbacksViewer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local With Callbacks Viewer</H1>
        <LocalWithCallbacksViewer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
