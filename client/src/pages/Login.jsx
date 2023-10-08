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
  const { user, publicServices, setUser } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // url/?domain=example.com
  const domain = searchParams.get("domain");

  useEffect(() => {
    if (user && domain && publicServices.find((s) => s.domain === domain)) {
      // If the user is already logged in and the domain parameter is specified,
      // redirect the user to the external service with the service key.
      authorizeAndRedirectUserToService();
    }
  }, [publicServices.length, user]);

  const authorizeAndRedirectUserToService = async () => {
    const data = await authorizeApi.authorizeForService(domain);
    const service = publicServices.find((s) => s.domain === domain);

    if (!service) return console.log("service not found for domain: ", domain);

    const protocol = service.protocol;

    window.location.href = `${protocol}://${domain}/?user_key=${data.user_key}`;
  };

  if (domain && !publicServices.find((s) => s.domain === domain)) {
    return (
      <main className="px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <p>
          URL kentän domain parametrin arvo ei sisällä mitään sallituista
          sivuista.
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
      if (domain) {
        // If an external service was specified with the domain parameter.
        authenticatedUser = await authenticateApi.authenticateForService(
          credentials,
          domain,
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

      if (domain) {
        // If an external service was specified with the domain parameter.
        const service = publicServices.find((s) => s.domain === domain);

        if (!service)
          return console.log("service not found for domain: ", domain);

        const protocol = service.protocol;

        window.location.href = `${protocol}://${domain}/?user_key=${authenticatedUser.user_key}`;
      } else navigate("/");
    } else alert("Failed to login. Wrong email or password?");
  };

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
