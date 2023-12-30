import { useEffect } from "react";

import authorizeApi from "../api/authorize";
import userApi from "../api/users";
import { useStore } from "./store";

export function LocalStorageSync() {
  const { setUser } = useStore();

  const loadLocalStorage = async () => {
    const usersAuth = localStorage.getItem('usersAuth')

    if (usersAuth) {
      // Set the authorization header for all requests.
      authorizeApi.setAuthorization(usersAuth);

      try {
        // Load user information from the server.
        setUser(await userApi.get());
      
      } catch (error) {
        localStorage.removeItem('usersAuth')
      }
    }
  };

  useEffect(() => {
    loadLocalStorage();
  }, []);

  return null;
}
