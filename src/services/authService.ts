import api from "../api/axios";

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "buyer" | "seller" | "";
}

export const signUpService = async (data: SignupFormData) => {
  try {
    const response = await api.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    console.error("signup error", error);
  }
};


export interface LoginCredentials {
  email: string;
  password: string; 
}


export const loginService = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
