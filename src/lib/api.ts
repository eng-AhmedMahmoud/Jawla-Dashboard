import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthResponse, LoginDto, RegisterDto } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://back-jawla.tajera.net/api/v1";

/** Backend origin without /api/v1 path */
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

/**
 * Resolve image URLs from the backend to full absolute URLs.
 * The backend may return URLs with the wrong origin (using the request's
 * Origin header instead of its own), so any URL containing /uploads/
 * is rewritten to use the backend origin.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  // Any /uploads/ URL must point to the backend, strip any wrong origin
  if (url.includes("/uploads/")) {
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    return `${API_ORIGIN}${path}`;
  }
  if (url.startsWith("http")) return url;
  return `${API_ORIGIN}${url}`;
}

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

  // Blog Methods
  async getAllBlogs(tag?: string) {
    const params = tag ? { tag } : {};
    const response = await this.api.get("/news", { params });
    return response.data;
  }

  async getAllBlogsAdmin() {
    const response = await this.api.get("/news/admin/all");
    return response.data;
  }

  async getBlogBySlug(slug: string) {
    const response = await this.api.get(`/news/${slug}`);
    return response.data;
  }

  async createBlog(data: any) {
    const response = await this.api.post("/news", data);
    return response.data;
  }

  async updateBlog(id: string, data: any) {
    const response = await this.api.patch(`/news/${id}`, data);
    return response.data;
  }

  async deleteBlog(id: string) {
    const response = await this.api.delete(`/news/${id}`);
    return response.data;
  }

  // Inquiry Methods
  async getAllInquiries() {
    const response = await this.api.get("/inquiries");
    return response.data;
  }

  async updateInquiryStatus(id: string, status: string) {
    const response = await this.api.patch(`/inquiries/${id}/status`, { status });
    return response.data;
  }

  // Content Methods
  async getAllContentAdmin() {
    const response = await this.api.get("/content/admin/all");
    return response.data;
  }

  async getContent(page?: string) {
    const params = page ? { page } : {};
    const response = await this.api.get("/content", { params });
    return response.data;
  }

  async getContentById(id: string) {
    const response = await this.api.get(`/content/${id}`);
    return response.data;
  }

  async createContent(data: any) {
    const response = await this.api.post("/content", data);
    return response.data;
  }

  async updateContent(id: string, data: any) {
    const response = await this.api.patch(`/content/${id}`, data);
    return response.data;
  }

  async deleteContent(id: string) {
    const response = await this.api.delete(`/content/${id}`);
    return response.data;
  }

  // About Page Methods
  async getAboutPage() {
    const response = await this.api.get("/about");
    return response.data;
  }

  async getAboutConfig() {
    const response = await this.api.get("/about/config");
    return response.data;
  }

  async updateAboutConfig(data: any) {
    const response = await this.api.patch("/about/config", data);
    return response.data;
  }

  async getAboutStats() {
    const response = await this.api.get("/about/stats");
    return response.data;
  }

  async createAboutStat(data: any) {
    const response = await this.api.post("/about/stats", data);
    return response.data;
  }

  async updateAboutStat(id: string, data: any) {
    const response = await this.api.patch(`/about/stats/${id}`, data);
    return response.data;
  }

  async deleteAboutStat(id: string) {
    const response = await this.api.delete(`/about/stats/${id}`);
    return response.data;
  }

  async getAboutCards(section?: string) {
    const params = section ? { section } : {};
    const response = await this.api.get("/about/cards", { params });
    return response.data;
  }

  async getAboutCardsAdmin() {
    const response = await this.api.get("/about/cards/admin");
    return response.data;
  }

  async createAboutCard(data: any) {
    const response = await this.api.post("/about/cards", data);
    return response.data;
  }

  async updateAboutCard(id: string, data: any) {
    const response = await this.api.patch(`/about/cards/${id}`, data);
    return response.data;
  }

  async deleteAboutCard(id: string) {
    const response = await this.api.delete(`/about/cards/${id}`);
    return response.data;
  }

  // FAQ Methods
  async getFaqPage() {
    const response = await this.api.get("/faq");
    return response.data;
  }

  async getFaqConfig() {
    const response = await this.api.get("/faq/config");
    return response.data;
  }

  async updateFaqConfig(data: any) {
    const response = await this.api.patch("/faq/config", data);
    return response.data;
  }

  async getFaqItemsAdmin() {
    const response = await this.api.get("/faq/admin/items");
    return response.data;
  }

  async createFaqItem(data: any) {
    const response = await this.api.post("/faq/items", data);
    return response.data;
  }

  async updateFaqItem(id: string, data: any) {
    const response = await this.api.patch(`/faq/items/${id}`, data);
    return response.data;
  }

  async deleteFaqItem(id: string) {
    const response = await this.api.delete(`/faq/items/${id}`);
    return response.data;
  }

  // Flights Page Methods
  async getFlightsPage() {
    const response = await this.api.get("/flights");
    return response.data;
  }

  async getFlightsConfig() {
    const response = await this.api.get("/flights/config");
    return response.data;
  }

  async updateFlightsConfig(data: any) {
    const response = await this.api.patch("/flights/config", data);
    return response.data;
  }

  async getFlightsWhyCards() {
    const response = await this.api.get("/flights/why-cards");
    return response.data;
  }

  async getFlightsWhyCardsAdmin() {
    const response = await this.api.get("/flights/why-cards/admin");
    return response.data;
  }

  async createFlightsWhyCard(data: any) {
    const response = await this.api.post("/flights/why-cards", data);
    return response.data;
  }

  async updateFlightsWhyCard(id: string, data: any) {
    const response = await this.api.patch(`/flights/why-cards/${id}`, data);
    return response.data;
  }

  async deleteFlightsWhyCard(id: string) {
    const response = await this.api.delete(`/flights/why-cards/${id}`);
    return response.data;
  }

  async getFlightsPopularRoutes() {
    const response = await this.api.get("/flights/popular-routes");
    return response.data;
  }

  async updateFlightsPopularRoute(id: string, data: any) {
    const response = await this.api.patch(`/flights/popular-routes/${id}`, data);
    return response.data;
  }

  // Hajj & Umrah Page Methods
  async getHajjUmrahPage() {
    const response = await this.api.get("/hajj-umrah");
    return response.data;
  }

  async getHajjUmrahAdmin() {
    const response = await this.api.get("/hajj-umrah/admin");
    return response.data;
  }

  async updateHajjUmrahConfig(data: any) {
    const response = await this.api.patch("/hajj-umrah/admin/config", data);
    return response.data;
  }

  async updateHajjUmrahCard(cardType: string, data: any) {
    const response = await this.api.patch(`/hajj-umrah/admin/cards/${cardType}`, data);
    return response.data;
  }

  // Hero Slider Methods
  async getAllHeroSliders() {
    const response = await this.api.get("/hero-sliders/admin/all");
    return response.data;
  }

  async getHeroSliderById(id: string) {
    const response = await this.api.get(`/hero-sliders/${id}`);
    return response.data;
  }

  async createHeroSlider(data: any) {
    const response = await this.api.post("/hero-sliders", data);
    return response.data;
  }

  async updateHeroSlider(id: string, data: any) {
    const response = await this.api.patch(`/hero-sliders/${id}`, data);
    return response.data;
  }

  async deleteHeroSlider(id: string) {
    const response = await this.api.delete(`/hero-sliders/${id}`);
    return response.data;
  }

  // Upload Methods
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.api.post("/upload/image", formData, {
      headers: { "Content-Type": undefined },
    });
    return {
      ...response.data,
      url: resolveImageUrl(response.data.url),
    };
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

