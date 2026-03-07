import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthResponse, LoginDto, RegisterDto } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://back-jawla.tajera.net/api/v1";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Only redirect if this is not a login/register request
          const isAuthEndpoint = error.config?.url?.includes('/auth/');
          
          if (!isAuthEndpoint) {
            // Clear auth and redirect to login only for authenticated endpoints
            this.clearToken();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/auth/register", data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/auth/login", data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.api.post("/auth/forgot-password", { email });
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<void> {
    await this.api.post("/auth/reset-password", {
      token,
      newPassword,
      confirmNewPassword,
    });
  }

  // User Methods
  async getProfile() {
    const response = await this.api.get("/users/profile");
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.patch("/users/profile", data);
    return response.data;
  }

  async deleteProfile() {
    await this.api.delete("/users/profile");
  }

  async getAllUsers() {
    const response = await this.api.get("/users");
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.api.post("/users", data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.api.patch(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    await this.api.delete(`/users/${id}`);
  }

  // Package Methods
  async getAllPackages(featured?: boolean) {
    const params = featured ? { featured } : {};
    const response = await this.api.get("/packages", { params });
    return response.data;
  }

  async getPackageBySlug(slug: string) {
    const response = await this.api.get(`/packages/${slug}`);
    return response.data;
  }

  async createPackage(data: any) {
    const response = await this.api.post("/packages", data);
    return response.data;
  }

  async updatePackage(id: string, data: any) {
    const response = await this.api.patch(`/packages/${id}`, data);
    return response.data;
  }

  async deletePackage(id: string) {
    const response = await this.api.delete(`/packages/${id}`);
    return response.data;
  }

  // News Methods
  async getAllNews(tag?: string) {
    const params = tag ? { tag } : {};
    const response = await this.api.get("/news", { params });
    return response.data;
  }

  async getAllNewsAdmin() {
    const response = await this.api.get("/news/admin/all");
    return response.data;
  }

  async getNewsBySlug(slug: string) {
    const response = await this.api.get(`/news/${slug}`);
    return response.data;
  }

  async createNews(data: any) {
    const response = await this.api.post("/news", data);
    return response.data;
  }

  async updateNews(id: string, data: any) {
    const response = await this.api.patch(`/news/${id}`, data);
    return response.data;
  }

  async deleteNews(id: string) {
    const response = await this.api.delete(`/news/${id}`);
    return response.data;
  }

  // Token Management
  private setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const apiService = new ApiService();

