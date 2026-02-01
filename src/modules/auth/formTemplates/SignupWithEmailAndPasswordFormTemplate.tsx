import { TextInput } from "@/components/custom/CustomInputs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type TFormContentInputs = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};
export const SignupWithEmailAndPasswordFormTemplate = (p: {
  onSubmit: (x: TFormContentInputs) => void;
  FeedbackMessagesComponent: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  return (
    <div className="flex flex-col gap-4">
      {p.FeedbackMessagesComponent}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (isLoading) return;
          setIsLoading(true);
          await p.onSubmit({ name, email, password, passwordConfirm });
          setIsLoading(false);
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <Label htmlFor="name">Full Name</Label>
          <TextInput
            id="name"
            value={name}
            onInput={setName}
            disabled={isLoading}
            name="name"
            type="text"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="signup-email">Email</Label>
          <TextInput
            id="signup-email"
            value={email}
            onInput={setEmail}
            disabled={isLoading}
            name="signup-email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <Label htmlFor="signup-password">Password</Label>
          <TextInput
            id="signup-password"
            value={password}
            onInput={setPassword}
            disabled={isLoading}
            name="signup-password"
            type="password"
            placeholder="Create a password"
            required
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <TextInput
            id="confirm-password"
            value={passwordConfirm}
            onInput={setPasswordConfirm}
            disabled={isLoading}
            name="confirm-password"
            type="password"
            placeholder="Confirm your password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
};
