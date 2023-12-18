import axios from "axios";
import axiosRetry from "axios-retry";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const url = `${apiUrl}/authorize`;

let session_key = null;

const setSessionKey = newSessionKey => {
  session_key = newSessionKey;
};

// Makes sure that the session_key is sent if it has been defined.
// Also sends the object as data if it has been defined as a
// parameter.
export const config = (object) => {
  if (!session_key && !object) return {};

  if (session_key && !object) return { headers: { Authorization: session_key } };

  if (!session_key && object) return { data: object };

  return {
    headers: { Authorization: session_key },
    data: object,
  };
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

  session_key = null;

  return response.data;
};

export default { setSessionKey, authorizeForApp, logout };
