import { H1 } from "@/components/custom/H1";
import { MainFixedLayout } from "@/components/templates/LayoutTemplate";
import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { LocalViewerOrchestrator } from "@/modules/webRtc/LocalViewerOrchestrator";

export default function Page() {
  return (
    <LoggedInUserOnlyRoute>
      <MainFixedLayout>
        <H1>Viewer Orchestrator</H1>
        <LocalViewerOrchestrator />
      </MainFixedLayout>
    </LoggedInUserOnlyRoute>
  );
}
