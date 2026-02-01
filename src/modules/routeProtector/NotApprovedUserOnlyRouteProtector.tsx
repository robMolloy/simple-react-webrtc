import { LoadingScreen } from "@/screens/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { ApprovedUserOnlyRouteProtectorTemplate } from "../auth/routeProtectorTemplates/ApprovedUserOnlyRouteProtectorTemplate";

export const NotApprovedUserOnlyRouteProtector = (p: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <ApprovedUserOnlyRouteProtectorTemplate
      // children={<div>this should not be shown</div>}
      LoadingComponent={<LoadingScreen />}
      onIsApproved={() => navigate("/")}
      NotApprovedComponent={p.children}
    />
  );
};
