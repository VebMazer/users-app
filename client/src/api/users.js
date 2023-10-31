import axios from "axios";
import axiosRetry from "axios-retry";
import commonApi from "./common";
import { config } from "./authorize";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const path = "/users";
const url = apiUrl + path;

const create = async (object) => {
  return await axios.post(url, object, config())
}

const update = async (id, object) => commonApi.put(id, object, path);
const remove = async (id) => commonApi.del(id, path);

const get = async () => {
  const response = await axios.get(url, config());

  return response.data;
};

const getAll = async () => {
  const response = await axios.get(`${url}/all`, config());

  return response.data;
};

export default { create, update, remove, get, getAll };
