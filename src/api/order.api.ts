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
    return api.get(`/orders/${id}`);
  },

  create: (payload: OrderPayload) => {
    return api.post("/orders", payload);
  },

  cancel: (id: number) => {
    return api.patch(`/orders/${id}/cancel`);
  },
};

export default orderApi;
