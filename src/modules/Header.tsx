import { CustomIcon } from "@/components/custom/CustomIcon";
import { HeaderTemplate } from "@/components/templates/HeaderTemplate";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./themeToggle/ThemeToggle";
import { Button } from "@/components/ui/button";
import { logout } from "./auth/dbAuthUtils";
import { pb } from "@/config/pocketbaseConfig";
import { useCurrentUserStore } from "./auth/authDataStore";

export const Header = () => {
  const currentUserStore = useCurrentUserStore();
  return (
    <HeaderTemplate
      Left={
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <CustomIcon iconName="Cloud" size="lg" />
          <span className="font-bold">pokkit Starter</span>
        </Link>
      }
      Right={
        <div className="flex gap-2">
          {currentUserStore.data.authStatus === "loggedIn" && (
            <Button variant="outline" onClick={() => logout({ pb })}>
              <CustomIcon iconName="LogOutIcon" size="lg" />
              Sign out
            </Button>
          )}
          <ThemeToggle />
        </div>
      }
    />
  );
};
