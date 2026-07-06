/** Sede (branch) del negocio. */
export interface Branch {
  id: string;
  businessId: string;
  branchTypeId: string;
  name: string;
  municipalityId: string;
  neighborhoodId?: string | null;
  addressLine?: string | null;
  phone?: string | null;
  isMain?: boolean;
  statusId?: string | null;
  enabled?: boolean;
}

export interface BranchPayload {
  businessId: string;
  branchTypeId: string;
  name: string;
  municipalityId: string;
  neighborhoodId?: string | null;
  addressLine?: string | null;
  phone?: string | null;
  isMain?: boolean;
}
