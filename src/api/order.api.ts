import api from "./axios";

export interface OrderPayload {
  orderItems: { productId: number; quantity: number }[];
  userInfo: { name: string; address: string; notes: string };
  paymentMode: string;
  userId: number;
}

const orderApi = {
  getAll: () => {
    return api.get("/orders/my-orders");
  },
  getById: (id: number) => {
    api.get(`/orders/${id}`);
  },

  create: (payload: OrderPayload) => {
    console.log({ payload });
    return api.post("/orders", payload);
  },
};

export default orderApi;
