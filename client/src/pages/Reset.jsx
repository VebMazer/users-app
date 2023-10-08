import { useState } from "react";

import resetApi from "../api/reset";
import { useStore } from "../utils/store";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router-dom";

export default function Reset() {
  const [email, setEmail] = useState("");

  const { user } = useStore();

  if (user)
    return (
      <main className="flex flex-col grow justify-center items-center gap-2 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <h2 className="text-3xl">
          This page is only available when you are not logged in.
        </h2>
        <Link to="/" className="opacity-70 hover:opacity-100 hover:underline">
          Mene takasin etusivulle
        </Link>
      </main>
    );

  const resetPassword = async (event) => {
    event.preventDefault();
    console.log("Resetting password for: " + email);
    const message = await resetApi.reset({ email });

    if (message.success) {
      alert(
        "Password change link has been sent to your email address. It will expire in 10 minutes.",
      );
    } else if (message.error) {
      alert("Reset failed,", message.error);
    }
  };

  return (
    <main className="flex flex-col min-h-0 grow justify-center items-center gap-3 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col w-full max-w-xs gap-4">
        <h2 className="text-xl">Change your password</h2>
        <p className="text-xs opacity-70">
          A link will be sent to your email that will allow you to change
          your password.
        </p>
        <form onSubmit={resetPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="textInput"
            />
          </div>
          <Button type="submit">Change password</Button>
        </form>
      </div>
    </main>
  );
}
