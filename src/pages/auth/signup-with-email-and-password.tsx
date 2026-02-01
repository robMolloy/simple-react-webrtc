import { CenteredItemTemplate } from "@/components/templates/CenteredItemTemplate";
import { pb } from "@/config/pocketbaseConfig";
import { PocketbaseSignupWithEmailAndPasswordForm } from "@/modules/auth/forms/SignupWithEmailAndPasswordForm";
import { Link } from "@/modules/auth/formTemplates/formHelperTemplates/Link";
import { SimpleCard } from "@/modules/auth/formTemplates/formHelperTemplates/SimpleCard";
import { LoggedOutUserOnlyRoute } from "@/modules/routeProtector/LoggedOutUserOnlyRoute";

export default function Page() {
  return (
    <LoggedOutUserOnlyRoute>
      <CenteredItemTemplate>
        <SimpleCard
          title="Sign up with Email and Password"
          headerChildrenTop={
            <Link href="/auth" className="text-muted-foreground hover:underline">
              &lt; Back
            </Link>
          }
        >
          <PocketbaseSignupWithEmailAndPasswordForm pb={pb} />
        </SimpleCard>
      </CenteredItemTemplate>
    </LoggedOutUserOnlyRoute>
  );
}
