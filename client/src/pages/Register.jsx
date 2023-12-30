import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import userApi from "../api/users";
import authorizeApi from "../api/authorize";
import authenticateApi from "../api/authenticate";
import { useStore } from "../utils/store";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Register() {
  const { user, setUser, publicApps } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // /register/?app_name=test
  const app_name = searchParams.get("app_name");
  // Send app name with the registration request, and redirect to the apps page
  // after the user has confirmed their email?

  if (app_name && !publicApps.find(a => a.name === app_name)) {
    return (
      <main className="px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <p>
          The app_name parameter on the URL does not contain any of the allowed apps.
        </p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <p>You have logged in with email: {user.email}</p>
      </main>
    );
  }

  const validate = () => {
    if (password.length < 11) {
      alert("password is too short");
      return false;
    }
    if (password !== passwordCheck) {
      alert("passwords do not match.");
      return false;
    }
    if (email.length < 5) {
      alert("email is too short to be valid");
      return false;
    }
    if (!email.includes("@")) {
      alert("email is invalid");
      return false;
    }

    return true;
  };

  const register = async event => {
    event.preventDefault();

    if (!validate()) return;

    const credentials = { password, email };

    try {
      const response = await userApi.create(credentials);

      if (response.status == 201) {

        alert(
          `Account created! Please confirm your account by pressing a link sent to: ${email}`
        );

        navigate("/");
      
      } else alert("Registration failed on the server.");
    
    } catch (exception) {
      alert("Registration failed on the server.");
    }
  }

  return (
    <main className="flex flex-col min-h-0 flex-1 gap-3 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col grow justify-center items-center">
        <div className="flex flex-col w-full max-w-xs gap-2">
          <h2 className="text-xl">Create a Portal account</h2>

          <p className="text-xs opacity-70">
            Your email will be verified to complete your registration.
          </p>
          <form onSubmit={register} className="flex flex-col gap-3">
            <div className="">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="textInput"
              />
            </div>
            <div className="">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="textInput"
              />
            </div>
            <div className="">
              <Label htmlFor="confirm">Retype password</Label>
              <Input
                id="confirm"
                type="password"
                value={passwordCheck}
                onChange={(event) => setPasswordCheck(event.target.value)}
                className="textInput"
              />
            </div>
            <Button type="submit">Register</Button>
          </form>
        </div>
      </div>
    </main>
  );
}
