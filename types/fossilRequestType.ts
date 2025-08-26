import { RequestStatus, RequestPriority } from "@/lib/generated/prisma";

export interface FossilRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  fossilType: string;
  description: string;
  maxBudget: number | null;
  geologicalPeriod: string | null;
  category: string | null;
  countryOfOrigin: string | null;
  locality: string | null;
  status: RequestStatus;
  priority: RequestPriority;
  adminNotes: string | null;
  responseMessage: string | null;
  respondedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FossilRequestFilters {
  status?: RequestStatus;
  priority?: RequestPriority;
  search?: string;
  page?: number;
}

export interface FossilRequestListProps {
  requests: FossilRequest[];
  totalPages: number;
  currentPage: number;
  totalRequests: number;
}

export interface FossilRequestUpdateData {
  status?: RequestStatus;
  priority?: RequestPriority;
  adminNotes?: string;
  responseMessage?: string;
  respondedBy?: string;
}
