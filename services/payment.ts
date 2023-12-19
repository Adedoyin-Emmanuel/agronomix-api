import axios from "axios";
const startPayment = (amount: number, email: string) => {
  const amountInKobo = amount * 100;
  return axios({
    method: "POST",
    url: `${process.env.PAYSTACK_BASEURL}/transaction/initialize`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    data: {
      email: email,
      amount: amountInKobo,
    },
    //channels can also be there but i feel we should choose the channel we want on paysatck
  });
};
const completePayment = (reference: string) => {
  return axios({
    method: "GET",
    url: `${process.env.PAYSTACK_BASEURL}/transaction/verify/${reference}`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });
};
export { startPayment, completePayment };
