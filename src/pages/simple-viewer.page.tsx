import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { SimpleViewer } from "@/modules/webRtc/SimpleViewer";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Simple Viewer</H1>
        <SimpleViewer />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
