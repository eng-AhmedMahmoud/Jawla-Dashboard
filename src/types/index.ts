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
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  currency?: string;
  duration: string;
  image: string;
  isFeatured?: boolean;
  type: PackageType;
  rating?: number;
  reviewsCount?: number;
  includedServicesAr: string[];
  includedServicesEn: string[];
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackageDto {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  currency?: string;
  duration: string;
  image: string;
  isFeatured?: boolean;
  type: PackageType;
  includedServicesAr: string[];
  includedServicesEn: string[];
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {}

// Blog Models
export interface Blog {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  slug: string;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  image?: string;
  tags: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogDto {
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  slug?: string;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
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

// Content Models
export type ContentPage = "HOME" | "FLIGHTS" | "PACKAGES" | "HAJJ_UMRAH" | "BLOGS" | "ABOUT" | "CONTACT" | "FAQ";

export interface Content {
  id: string;
  page: ContentPage;
  textAr: string;
  textEn: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContentDto {
  page: ContentPage;
  textAr: string;
  textEn: string;
  isActive?: boolean;
}

export interface UpdateContentDto extends Partial<CreateContentDto> {}

// Hero Slider Models
export interface HeroSlider {
  id: string;
  titleAr: string;
  titleEn: string;
  image: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHeroSliderDto {
  titleAr: string;
  titleEn: string;
  image: string;
  linkUrl: string;
  order: number;
  isActive?: boolean;
}

export interface UpdateHeroSliderDto extends Partial<CreateHeroSliderDto> {}

// About Page Models
export interface AboutConfig {
  id: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string | null;
  heroSubtitleEn: string | null;
  heroIconUrl: string | null;
  aboutTitleAr: string;
  aboutTitleEn: string;
  aboutDescriptionAr: string | null;
  aboutDescriptionEn: string | null;
  aboutImageUrl: string | null;
  aboutImageCaptionAr: string | null;
  aboutImageCaptionEn: string | null;
  updatedAt: string;
}

export interface AboutStat {
  id: string;
  valueAr: string;
  valueEn: string;
  labelAr: string;
  labelEn: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AboutCardSection = "VISION_MISSION" | "VALUES" | "SERVICES";

export interface AboutCard {
  id: string;
  section: AboutCardSection;
  iconName?: string | null;
  iconColor?: string | null;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutPageData {
  config: AboutConfig;
  stats: AboutStat[];
  visionMission: AboutCard[];
  values: AboutCard[];
  services: AboutCard[];
}

// FAQ Models
export interface FaqConfig {
  id: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string | null;
  heroSubtitleEn: string | null;
  heroIconUrl: string | null;
  updatedAt: string;
}

export interface FaqItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqPageData {
  config: FaqConfig;
  items: FaqItem[];
}

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
