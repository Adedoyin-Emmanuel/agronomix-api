import { v4 as uuidv4 } from "uuid";

const generateLongToken = () => {
  const uuid = uuidv4();

  // more randomness to make the token longer
  const extraRandomData = Math.random().toString(36).substring(2);

  const longToken = uuid + extraRandomData;

  return longToken;
};
const generateOtp = (num: number) => {
  if (num <= 4) {
    return Math.floor(1000 + Math.random() * 9000);
  }
  const c = Math.pow(10, num - 1);
  return Math.floor(c + Math.random() * 9 * num);
};
export { generateLongToken, generateOtp };
