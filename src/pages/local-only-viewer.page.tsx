import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalOnlyViewer } from "@/modules/webRtc/LocalOnlyViewer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Local Only Viewer</H1>
        <LocalOnlyViewer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
