import { useEffect } from "react";
import Cookies from "universal-cookie";

import authorizeApi from "../api/authorize";
import userApi from "../api/users";
import { useStore } from "./store";

export function CookieTracker() {
  const { setUser } = useStore();

  const loadCookies = async () => {
    const cookies = new Cookies();
    const usersAuth = cookies.get("usersAuth");

    if (usersAuth) {
      // Set the authorization header for all requests.
      authorizeApi.setAuthorization(usersAuth);

      try {
        // Load user information from the server.
        setUser(await userApi.get());
      } catch (error) {
        // If the session is invalid, remove the authorization cookie.
        cookies.remove("usersAuth");
      }
    }
  };
  useEffect(() => {
    loadCookies();
  }, []);

  return null;
}
