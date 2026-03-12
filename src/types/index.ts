// Auth Models
export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileDto {
  name?: string;
  password?: string;
  phone?: string;
}

// Package Models
export type PackageType = "GENERAL" | "HAJJ" | "UMRAH";

export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  duration: string;
  image: string;
  isFeatured?: boolean;
  type: PackageType;
  includedServices: string[];
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackageDto {
  title: string;
  description: string;
  price: number;
  currency?: string;
  duration: string;
  image: string;
  isFeatured?: boolean;
  type: PackageType;
  includedServices: string[];
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {}

// Blog Models
export interface Blog {
  id: string;
  title: string;
  content: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
  tags: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
  tags: string[];
  isPublished?: boolean;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

// Inquiry Models
export type InquiryStatus = "PENDING" | "REVIEWED" | "RESOLVED";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  travelers: number;
  packageId: string;
  package?: Package;
  status: InquiryStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Create/Update User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "USER";
  phone: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

// API Response Wrapper
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
