import axios from "axios";
import axiosRetry from "axios-retry";
import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const url = `${apiUrl}/authenticate`;

const authenticate = async (credentials) => {
  const response = await axios.post(url, credentials);

  return response.data;
};

const authenticateForApp = async (credentials, app_name) => {
  const response = await axios.post(`${url}/${app_name}`, credentials);

  return response.data;
};

export default { authenticate, authenticateForApp };
