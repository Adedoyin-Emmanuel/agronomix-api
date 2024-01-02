import axios from "axios";

const SQUAD_PRIVATE_KEY = process.env.SQUAD_PRIVATE_KEY as string;
const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL as string;

const Axios = axios.create({
  baseURL: SQUAD_BASE_URL,
  headers: {
    Authorization: `Bearer ${SQUAD_PRIVATE_KEY}`,
  },
});


export default Axios;