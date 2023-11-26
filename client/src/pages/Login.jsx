// node imports
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "universal-cookie";

import authenticateApi from "../api/authenticate";
import authorizeApi from "../api/authorize";

import { useStore } from "../utils/store";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Login() {
  const { user, publicApps, setUser } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // url/?app_name=example-app-name
  const app_name = searchParams.get("app_name");

  useEffect(() => {
    if (user && app_name && publicApps.find(a => a.name === app_name)) {
      // If the user is already logged in and the app_name parameter is specified,
      // redirect the user to the external app with the user_key.
      authorizeAndRedirectUserToApp();
    }
  }, [publicApps.length, user]);

  const authorizeAndRedirectUserToApp = async () => {
    const data = await authorizeApi.authorizeForApp(app_name);
    const app = publicApps.find(a => a.name === app_name);

    if (!app) return console.log("app not with name: ", app_name);

    // Redirect the user with the user key to the app.
    window.location.href = `${app.url}/?user_key=${data.user_key}`;
  };

  if (app_name && !publicApps.find(a => a.name === app_name)) {
    // If the app_name parameter is specified but a corresponding app is
    // not found from the available apps.
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

  const loginButton = async (event) => {
    event.preventDefault();

    const credentials = {
      email,
      password,
    };

    let authenticatedUser = null;

    try {
      if (app_name) {
        // If an external app was specified with the app_name parameter.
        authenticatedUser = await authenticateApi.authenticateForApp(
          credentials,
          app_name,
        );
      } else {
        authenticatedUser = await authenticateApi.authenticate(credentials);
      }
    } catch (exception) {
      console.log("exception: ", exception);
    }

    if (authenticatedUser) {
      authorizeApi.setToken(authenticatedUser.token);

      const cookies = new Cookies();

      cookies.set("usersToken", authenticatedUser.token, {
        // Cookie expires in 60 days.
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        path: "/",
      });

      setUser(authenticatedUser);

      if (app_name) {
        // If an external app was specified with the app_name parameter.
        const app = publicApps.find(a => a.name === app_name);

        if (!app) return console.log("app not found with app_name: ", app_name);

        window.location.href = `${app.url}/?user_key=${authenticatedUser.user_key}`;
      
      } else navigate("/");
    } else alert("Failed to login. Wrong email or password?");
  }

  return (
    <main className="flex flex-col grow justify-center items-center gap-3 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col w-full max-w-xs gap-2">
        <h2 className="text-xl">Login to Portal Apps</h2>
        <p className="text-xs opacity-70">
          If you were redirected from another portal app, you will be redirected back to it
          after you log in.
        </p>
        <form onSubmit={loginButton} className="flex flex-col gap-4">
          <div className="">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button type="submit">Log In</Button>
        </form>
        <div className="flex flex-col pt-3">
          <Link to="/resetpassword" className="loginLink">
            Forgot Password?
          </Link>
        </div>
      </div>
    </main>
  );
}
