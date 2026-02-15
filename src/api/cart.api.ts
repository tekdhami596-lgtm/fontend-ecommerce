import api from "./axios";

const cartApi = {
  get: () => {
    return api.get("/carts");
  },
  create: (payload: { productId: number }) => {
    return api.post("/carts", payload);
  },
  update: (cartId: number, quantity: number) => {
    return api.put(`/carts/${cartId}`, { quantity });
  },
  delete: (cartId: number) => {
    return api.delete(`/carts/${cartId}`);
  },
};

export const getCartItems = () => {
  return api.get("/carts");
};

export default cartApi;
