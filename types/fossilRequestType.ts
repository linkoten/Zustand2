import {
  RequestStatus,
  RequestPriority,
  UserRole,
} from "@/lib/generated/prisma";

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
  userRole?: UserRole;
  respondedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FossilRequestFilters {
  status?: RequestStatus;
  priority?: RequestPriority;
  search?: string;
  page?: number;
  userOnly?: boolean; // ✅ Ajouter cette propriété
}

export interface FossilRequestListProps {
  requests: FossilRequest[];
  totalPages: number;
  currentPage: number;
  totalRequests: number;
  userRole: UserRole;
}

export interface FossilRequestUpdateData {
  status?: RequestStatus;
  priority?: RequestPriority;
  adminNotes?: string | null;
  responseMessage?: string | null;
  respondedBy?: string;
}
