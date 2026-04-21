export type UserRole = "customer" | "spaguy" | "admin";

export interface Address {
  street: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
}

export interface Rating {
  average: number;
  count: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string | null;
  address: Address;
  isVerified?: boolean;
  isActive?: boolean;
  availability?: "available" | "busy" | "offline";
  companyName?: string | null;
  service?: string | null;
  serviceName?: string | null;
  category?: "technician" | "parts" | "others" | null;
  specialization?: string | null;
  rating?: Rating;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  limit?: number;
  results?: T[];
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ChartPoint {
  _id: {
    year?: number;
    month?: number;
  } | string;
  count?: number;
  revenue?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalTechnicians: number;
  totalServiceRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalRevenue: number;
}

export interface ServiceRequest {
  _id: string;
  customer: User;
  assignedTechnician?: User | null;
  status: "pending" | "quoted" | "confirmed" | "in_progress" | "completed" | "cancelled";
  environment: string;
  equipment: string;
  location: string;
  serviceType: string;
  problemDescription: string;
  specialInstruction: string;
  evidencePhotos: { url: string }[];
  address: Address;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  sessionDuration?: number | null;
  serviceFee?: number;
  facilityTax?: number;
  totalDue?: number;
  paymentStatus?: "unpaid" | "paid" | "partial";
  additionalCosts: AdditionalCost[];
  presentingProblem?: string;
  diagnosis?: string;
  postServicePhotos?: { url: string }[];
  completedAt?: string | null;
  createdAt?: string;
}

export interface AdditionalCost {
  _id: string;
  name: string;
  description: string;
  amount: number;
  notes: string;
  photos: { url: string }[];
  paymentStatus: "unpaid" | "paid";
}

export interface Payment {
  _id: string;
  serviceRequest: Pick<ServiceRequest, "_id" | "serviceType" | "status" | "scheduledDate">;
  customer: Pick<User, "_id" | "name" | "email">;
  amount: number;
  type: "service_fee" | "additional_cost";
  additionalCostId?: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  paidAt?: string | null;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: Pick<User, "_id" | "name" | "avatar">;
  content: string;
  type: "text" | "image" | "video";
  mediaUrl?: string;
  createdAt: string;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalTransactions: number;
  avgTransaction: number;
}

export interface RoleVisibility {
  customer: Record<string, boolean>;
  spaguy: Record<string, boolean>;
}

export interface PlatformSettings {
  taxRate: number;
  maintenanceMode: boolean;
}
