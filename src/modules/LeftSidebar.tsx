import { LeftSidebarTemplate, SidebarButton } from "@/components/templates/LeftSidebarTemplate";
import { pb } from "@/config/pocketbaseConfig";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useCurrentUserStore } from "./auth/authDataStore";
import { logout } from "./auth/dbAuthUtils";
import { useGlobalUserPermissionsStore } from "./auth/globalUserPermissions/globalUserPermissionsStore";

export const LeftSidebar = () => {
  const currentUserStore = useCurrentUserStore();
  const globalUserPermissionsStore = useGlobalUserPermissionsStore();
  const [scrollItemIndex, setScrollItemIndex] = useState(0);

  const location = useLocation();

  return (
    <div className="w-64">
      <LeftSidebarTemplate
        top={
          <>
            <SidebarButton href="/" iconName="Home" isHighlighted={location.pathname === "/"}>
              Home
            </SidebarButton>
            <SidebarButton
              href="/scroll"
              iconName="Ban"
              isHighlighted={location.pathname === "/scroll"}
            >
              Scroll
            </SidebarButton>
            <SidebarButton
              href="/streamer"
              iconName="Ban"
              isHighlighted={location.pathname === "/streamer"}
            >
              Streamer
            </SidebarButton>
            <SidebarButton
              href="/viewer"
              iconName="Ban"
              isHighlighted={location.pathname === "/viewer"}
            >
              Viewer
            </SidebarButton>
            <SidebarButton
              href="/viewer-orchestrator"
              iconName="Ban"
              isHighlighted={location.pathname === "/viewer-orchestrator"}
            >
              Viewer Orchestrator
            </SidebarButton>
          </>
        }
        middle={[...Array(100)].map((_, j) => (
          <SidebarButton
            iconName="Ban"
            key={j}
            isHighlighted={j === scrollItemIndex}
            onClick={() => setScrollItemIndex(j)}
          >
            do summit {j} {j === scrollItemIndex && <>(selected)</>}
          </SidebarButton>
        ))}
        bottom={
          <>
            {globalUserPermissionsStore.data?.role == "admin" && (
              <SidebarButton
                href="/users"
                iconName="Users"
                isHighlighted={location.pathname === "/users"}
              >
                Users
              </SidebarButton>
            )}
            {currentUserStore.data.authStatus === "loggedIn" && (
              <SidebarButton iconName="LogOut" isHighlighted={false} onClick={() => logout({ pb })}>
                Log Out
              </SidebarButton>
            )}
          </>
        }
      />
    </div>
  );
};
