import { LoadingScreen } from "@/screens/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { ApprovedUserOnlyRouteProtectorTemplate } from "../auth/routeProtectorTemplates/ApprovedUserOnlyRouteProtectorTemplate";

export const ApprovedUserOnlyRouteProtector = (p: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <ApprovedUserOnlyRouteProtectorTemplate
      children={p.children}
      LoadingComponent={<LoadingScreen />}
      // NotApprovedComponent={<AwaitingApprovalScreen />}
      onIsNotApproved={() => navigate("/awaiting-approval")}
    />
  );
};
