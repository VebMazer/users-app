import axios from "axios";
import axiosRetry from "axios-retry";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const reset = async user => {
  try {
    const response = await axios.post(`${apiUrl}/reset`, user)

    return response.data
  
  } catch (exception) {
    const response = exception.response

    if (response) return response.data

    return { error: 'Unknown error.'}
  }
};

export default { reset };
