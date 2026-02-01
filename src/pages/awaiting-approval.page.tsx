import { LoggedInUserOnlyRoute } from "@/modules/routeProtector/LoggedInUserOnlyRoute";
import { NotApprovedUserOnlyRouteProtector } from "@/modules/routeProtector/NotApprovedUserOnlyRouteProtector";
import { AwaitingApprovalScreen } from "@/screens/AwaitingApprovalScreen";

const AwaitingApprovalPage = () => {
  return (
    <LoggedInUserOnlyRoute>
      <NotApprovedUserOnlyRouteProtector>
        <AwaitingApprovalScreen />
      </NotApprovedUserOnlyRouteProtector>
    </LoggedInUserOnlyRoute>
  );
};

export default AwaitingApprovalPage;
