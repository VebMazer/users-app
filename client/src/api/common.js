import axios from "axios";
import axiosRetry from "axios-retry";
import { config } from "./authorize";
import { apiUrl } from "../config";
const url = apiUrl;

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const getAll = async (app) => {
  const completeUrl = url + app;

  const response = await axios.get(completeUrl, config());

  console.log("got response!");
  return response.data;
};

const get = async (id, app) => {
  const response = await axios.get(url + app + `/${id}`, config());

  return response.data;
};

const post = async (object, app) => {
  const response = await axios.post(url + app, object, config());

  return response.data;
};

const put = async (id, object, app) => {
  const response = await axios.put(url + app + `/${id}`, object, config());

  return response.data;
};

const del = async (id, app) => {
  const response = await axios.delete(url + app + `/${id}`, config());

  return response.data;
};

export default { getAll, get, post, put, del };
