import axios from "axios";
import axiosRetry from "axios-retry";

import commonApi from "./common";
import { config } from "./authorize";
import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const path = "/apps";
const url = apiUrl + path;

// Get all public information about the apps.
const getAllPublic = async () => {
  const response = await axios.get(`${url}/public`);

  return response.data;
};

const getAll = async () =>           commonApi.getAll(path);
const create = async object =>       commonApi.post(object, path);
const update = async (id, object) => commonApi.put(id, object, path);
const remove = async id =>           commonApi.del(id, path);

export default { getAllPublic, getAll, create, update, remove };
