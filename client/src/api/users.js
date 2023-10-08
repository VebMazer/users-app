import axios from "axios";
import axiosRetry from "axios-retry";
import commonApp from "./common";
import { config } from "./authorize";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const app = "/users";
const url = apiUrl + app;

const create = async (object) => commonApp.post(object, app);
// const create = async object => {
//   const response = await axios.post("https://portal-virittamo.azurewebsites.net/api", object, config())
//   return response.data
// }

const update = async (id, object) => commonApp.put(id, object, app);
const remove = async (id) => commonApp.del(id, app);

const get = async () => {
  const response = await axios.get(url, config());

  return response.data;
};

const getAll = async () => {
  const response = await axios.get(`${url}/all`, config());

  return response.data;
};

export default { create, update, remove, get, getAll };
