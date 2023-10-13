import axios from "axios";
import axiosRetry from "axios-retry";
import commonApi from "./common";
import { config } from "./authorize";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const app = "/users";
const url = apiUrl + app;

const create = async (object) => commonApi.post(object, app);

const update = async (id, object) => commonApi.put(id, object, app);
const remove = async (id) => commonApi.del(id, app);

const get = async () => {
  const response = await axios.get(url, config());

  return response.data;
};

const getAll = async () => {
  const response = await axios.get(`${url}/all`, config());

  return response.data;
};

export default { create, update, remove, get, getAll };
