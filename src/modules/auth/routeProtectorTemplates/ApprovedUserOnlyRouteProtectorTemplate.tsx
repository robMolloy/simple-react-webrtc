import { useEffect } from "react";
import { useCurrentUserStore } from "../authDataStore";
import { useGlobalUserPermissionsStore } from "../globalUserPermissions/globalUserPermissionsStore";

export const ApprovedUserOnlyRouteProtectorTemplate = (p: {
  onIsLoading?: () => void;
  LoadingComponent?: React.ReactNode;
  onIsNotApproved?: () => void;
  NotApprovedComponent?: React.ReactNode;
  onIsApproved?: () => void;
  children?: React.ReactNode;
}) => {
  const currentUserStore = useCurrentUserStore();
  const globalUserPermissionsStore = useGlobalUserPermissionsStore();

  const isApproved =
    currentUserStore.data.authStatus === "loggedIn" &&
    globalUserPermissionsStore.data?.status === "approved";

  const isLoading =
    currentUserStore.data.authStatus === "loading" || globalUserPermissionsStore.data === undefined;

  useEffect(() => {
    if (isLoading) return p.onIsLoading?.();
    if (isApproved) return p.onIsApproved?.();
    return p.onIsNotApproved?.();
  }, [isLoading, isApproved]);

  console.log(`ApprovedUserOnlyRouteProtectorTemplate.tsx:${/*LL*/ 29}`, { isApproved, isLoading });

  if (isLoading) return p.LoadingComponent;
  if (!isApproved) return p.NotApprovedComponent;

  return p.children;
};
