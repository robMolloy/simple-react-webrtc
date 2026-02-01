import { signinWithPassword, signUpWithPassword } from "../dbAuthUtils";
import {
  FormFeedbackMessages,
  useFormFeedbackMessages,
} from "../formTemplates/formHelperTemplates/FormFeedbackMessages";
import { SignupWithEmailAndPasswordFormTemplate } from "../formTemplates/SignupWithEmailAndPasswordFormTemplate";
import type { PocketBase } from "../pocketbaseTypeHelpers";

type TFormContentInputs = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};
export const PocketbaseSignupWithEmailAndPasswordForm = (p: { pb: PocketBase }) => {
  const formFeedback = useFormFeedbackMessages();

  return (
    <SignupWithEmailAndPasswordFormTemplate
      FeedbackMessagesComponent={
        formFeedback.messages &&
        formFeedback.status && (
          <FormFeedbackMessages messages={formFeedback.messages} status={formFeedback.status} />
        )
      }
      onSubmit={async (formProps: TFormContentInputs) => {
        const { name, email, password, passwordConfirm } = formProps;
        if (password !== passwordConfirm) {
          const errorMessages = ["Passwords do not match"];
          formFeedback.showError(errorMessages);
          return;
        }

        const resp = await (async () => {
          const signUpResp = await signUpWithPassword({
            pb: p.pb,
            data: {
              name,
              email,
              emailVisibility: true,
              password,
              passwordConfirm,
            },
          });

          if (!signUpResp.success) return signUpResp;
          return signinWithPassword({ pb: p.pb, data: { email, password } });
        })();

        const showMessageFn = resp.success ? formFeedback.showSuccess : formFeedback.showError;
        showMessageFn(resp.messages);
      }}
    />
  );
};
