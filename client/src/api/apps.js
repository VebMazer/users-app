import axios from "axios";
import axiosRetry from "axios-retry";

import commonApp from "./common";
import { config } from "./authorize";
import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const app = "/apps";
const url = apiUrl + app;

// Get all public information about the apps.
const getAllPublic = async () => {
  const response = await axios.get(`${url}/public`);

  return response.data;
};

const getAll = async () => commonApp.getAll(app);
const create = async (object) => commonApp.post(object, app);
const update = async (id, object) => commonApp.put(id, object, app);
const remove = async (id) => commonApp.del(id, app);

export default { getAllPublic, getAll, create, update, remove };
