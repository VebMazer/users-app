import axios from "axios";
import axiosRetry from "axios-retry";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const url = `${apiUrl}/authorize`;

let token = null;

// Makes sure that the token is sent if it has been defined.
// Also sends the object as data if it has been defined as a
// parameter.
export const config = (object) => {
  if (!token && !object) return {};

  if (token && !object) return { headers: { Authorization: token } };

  if (!token && object) return { data: object };

  return {
    headers: { Authorization: token },
    data: object,
  };
};

const setToken = (newToken) => {
  if (newToken) token = `bearer ${newToken}`;
  else token = null;
};

// Authorize the user to use the app. Use this
// function when the user is already logged in to the user-app
// and therefore they dont need to authenticate themselves again.
const authorizeForApp = async app_name => {
  const response = await axios.get(`${url}/app/${app_name}`, config());

  return response.data;
};

// Logout the user from the user-app.
const logout = async () => {
  const response = await axios.get(`${url}/logout`, config());

  setToken(null);

  return response.data;
};

export default { setToken, authorizeForApp, logout };
