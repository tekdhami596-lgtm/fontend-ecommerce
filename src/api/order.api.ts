import api from "./axios";

export interface OrderPayload {
  orderItems: { productId: number; quantity: number }[];
  userInfo: { name: string; address: string; notes: string };
  paymentMode: string;
  userId: number;
}

const orderApi = {
  get: () => {
    return api.get("/orders");
  },
  create: (payload: OrderPayload) => {
    console.log({ payload });
    return api.post("/orders", payload);
  },
};

export default orderApi;
