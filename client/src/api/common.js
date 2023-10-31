import axios from "axios";
import axiosRetry from "axios-retry";
import { config } from "./authorize";
import { apiUrl } from "../config";
const url = apiUrl;

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const getAll = async (path) => {
  const completeUrl = url + path;

  const response = await axios.get(completeUrl, config());

  console.log("got response!");
  return response.data;
};

const get = async (id, path) => {
  const response = await axios.get(url + path + `/${id}`, config());

  return response.data;
};

const post = async (object, path) => {
  const response = await axios.post(url + path, object, config());

  return response.data;
};

const put = async (id, object, path) => {
  const response = await axios.put(url + path + `/${id}`, object, config());

  return response.data;
};

const del = async (id, path) => {
  const response = await axios.delete(url + path + `/${id}`, config());

  return response.data;
};

export default { getAll, get, post, put, del };
