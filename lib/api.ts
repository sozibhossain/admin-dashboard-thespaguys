"use client";

import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";
import type {
  ApiResponse,
  AuthPayload,
  ChartPoint,
  Conversation,
  DashboardStats,
  Message,
  PaginatedResponse,
  Payment,
  PlatformSettings,
  RevenueSummary,
  RoleVisibility,
  ServiceRequest,
  User,
} from "@/lib/types";

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_BASEURL ||
  process.env.NEXTPUBLICBASEURL ||
  "";

const BASE_URL = RAW_BASE_URL.endsWith("/api/v1")
  ? RAW_BASE_URL
  : `${RAW_BASE_URL.replace(/\/$/, "")}/api/v1`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<never>>) => {
    if (error.response?.status === 401) {
      await signOut({ redirect: true, callbackUrl: "/sign-in" });
    }
    return Promise.reject(error);
  },
);

function unwrap<T>(response: { data: ApiResponse<T> }) {
  return response.data.data;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export const api = {
  login: async (payload: { email: string; password: string }) =>
    unwrap<AuthPayload>(await axiosInstance.post("/auth/login", payload)),
  forgotPassword: async (payload: { email: string }) =>
    unwrap<void>(await axiosInstance.post("/auth/forgot-password", payload)),
  verifyOtp: async (payload: { email: string; code: string; purpose: "forgot_password" }) =>
    unwrap<{ resetToken: string }>(await axiosInstance.post("/auth/verify-otp", payload)),
  resetPassword: async (payload: {
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    unwrap<void>(await axiosInstance.post("/auth/reset-password", payload)),
  logout: async () => unwrap<void>(await axiosInstance.post("/auth/logout")),
  getProfile: async () => unwrap<{ user: User }>(await axiosInstance.get("/users/profile")),
  updateProfile: async (payload: FormData) =>
    unwrap<{ user: User }>(
      await axiosInstance.patch("/users/profile", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    ),
  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => unwrap<void>(await axiosInstance.patch("/auth/change-password", payload)),
  getDashboardStats: async () =>
    unwrap<DashboardStats>(await axiosInstance.get("/admin/dashboard")),
  getUsersChart: async () =>
    unwrap<{ data: ChartPoint[] }>(await axiosInstance.get("/admin/dashboard/users-chart")),
  getTechniciansChart: async () =>
    unwrap<{ data: ChartPoint[] }>(
      await axiosInstance.get("/admin/dashboard/technicians-chart"),
    ),
  getServiceRequestsChart: async () =>
    unwrap<{ data: Array<{ _id: string; count: number }> }>(
      await axiosInstance.get("/admin/dashboard/service-requests-chart"),
    ),
  getRevenueChart: async () =>
    unwrap<{ data: ChartPoint[] }>(await axiosInstance.get("/admin/dashboard/revenue-chart")),
  getTechnicianRankings: async (params: { page: number; limit: number }) =>
    unwrap<{
      rankings: Array<User & { completedJobs: number; totalEarnings: number }>;
    } & PaginatedResponse<User>>(await axiosInstance.get("/admin/dashboard/technician-rankings", { params })),
  getUsers: async (params: {
    search?: string;
    status?: string;
    page: number;
    limit: number;
  }) =>
    unwrap<{ users: User[] } & PaginatedResponse<User>>(
      await axiosInstance.get("/admin/users", { params }),
    ),
  getUserDetail: async (id: string) =>
    unwrap<{ user: User }>(await axiosInstance.get(`/admin/users/${id}`)),
  updateUserStatus: async (id: string, isActive: boolean) =>
    unwrap<{ user: User }>(await axiosInstance.patch(`/admin/users/${id}/status`, { isActive })),
  getUserChatHistory: async (id: string, params: { page: number; limit: number }) =>
    unwrap<{ conversations: Conversation[] } & PaginatedResponse<Conversation>>(
      await axiosInstance.get(`/admin/users/${id}/chats`, { params }),
    ),
  getConversations: async (params: { search?: string; page: number; limit: number }) =>
    unwrap<{ conversations: Conversation[] } & PaginatedResponse<Conversation>>(
      await axiosInstance.get("/chat/conversations", { params }),
    ),
  getMessages: async (conversationId: string, params: { page: number; limit: number }) =>
    unwrap<{ messages: Message[] } & PaginatedResponse<Message>>(
      await axiosInstance.get(`/chat/conversations/${conversationId}/messages`, { params }),
    ),
  getTechnicians: async (params: {
    search?: string;
    status?: string;
    page: number;
    limit: number;
  }) =>
    unwrap<{ technicians: User[] } & PaginatedResponse<User>>(
      await axiosInstance.get("/admin/technicians", { params }),
    ),
  getTechnicianDetail: async (id: string) =>
    unwrap<{ technician: User }>(await axiosInstance.get(`/admin/technicians/${id}`)),
  updateTechnicianStatus: async (id: string, isActive: boolean) =>
    unwrap<{ technician: User }>(
      await axiosInstance.patch(`/admin/technicians/${id}/status`, { isActive }),
    ),
  getRoleVisibility: async () =>
    unwrap<{ visibility: RoleVisibility }>(await axiosInstance.get("/admin/role-visibility")),
  updateRoleVisibility: async (payload: RoleVisibility) =>
    unwrap<{ visibility: RoleVisibility }>(
      await axiosInstance.patch("/admin/role-visibility", payload),
    ),
  getServiceRequests: async (params: {
    search?: string;
    status?: string;
    page: number;
    limit: number;
  }) =>
    unwrap<{ requests: ServiceRequest[] } & PaginatedResponse<ServiceRequest>>(
      await axiosInstance.get("/admin/service-requests", { params }),
    ),
  getServiceRequestDetail: async (id: string) =>
    unwrap<{ request: ServiceRequest }>(
      await axiosInstance.get(`/admin/service-requests/${id}`),
    ),
  assignServiceRequest: async (
    id: string,
    payload: {
      technicianId: string;
      scheduledDate: string;
      scheduledTime: string;
      sessionDuration?: number;
      serviceFee: number;
      facilityTax?: number;
    },
  ) =>
    unwrap<{ request: ServiceRequest }>(
      await axiosInstance.patch(`/admin/service-requests/${id}/assign`, payload),
    ),
  updateServiceRequestStatus: async (id: string, status: string) =>
    unwrap<{ request: ServiceRequest }>(
      await axiosInstance.patch(`/admin/service-requests/${id}/status`, { status }),
    ),
  getPayments: async (params: { page: number; limit: number }) =>
    unwrap<{ payments: Payment[] } & PaginatedResponse<Payment>>(
      await axiosInstance.get("/admin/payments", { params }),
    ),
  getRevenueStats: async () =>
    unwrap<{ summary: RevenueSummary; monthly: ChartPoint[] }>(
      await axiosInstance.get("/admin/payments/revenue"),
    ),
  sendGlobalNotification: async (payload: {
    title: string;
    message: string;
    targetRoles: "customer" | "spaguy" | "all";
  }) => unwrap<void>(await axiosInstance.post("/admin/notifications/global", payload)),
  getSettings: async () =>
    unwrap<{ settings: PlatformSettings }>(await axiosInstance.get("/admin/settings")),
  updateSettings: async (payload: Partial<PlatformSettings>) =>
    unwrap<{ settings: PlatformSettings }>(
      await axiosInstance.patch("/admin/settings", payload),
    ),
};
