/**
 * Modelos del dominio Empresa (alineados con business-service).
 * La empresa es el local (barbería/salón). Sus dominios/slug viven en una
 * tabla aparte (business_domain) con su propio ciclo de vida.
 */

export interface Business {
  id: string;
  businessTypeId: string;
  name: string;
  legalName?: string | null;
  tradeName?: string | null;
  documentTypeId?: string | null;
  documentNumber?: string | null;
  logoUrl?: string | null;
  statusId?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  enabled?: boolean;
  visible?: boolean;
  createdDate?: string;
  auditDate?: string;
}

export interface BusinessPayload {
  businessTypeId: string;
  name: string;
  legalName?: string | null;
  tradeName?: string | null;
  documentTypeId?: string | null;
  documentNumber?: string | null;
  logoUrl?: string | null;
  statusId?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export interface BusinessDomain {
  id: string;
  businessId: string;
  slug: string;
  customDomain?: string | null;
  isPrimary?: boolean;
  isVerified?: boolean;
  verifiedDate?: string | null;
  statusId?: string | null;
  enabled?: boolean;
}

export interface BusinessDomainPayload {
  businessId: string;
  slug: string;
  customDomain?: string | null;
  isPrimary?: boolean;
  statusId?: string | null;
}

/** Aprovisionamiento de un negocio nuevo (post-login del dueño). */
export interface ProvisionRequest {
  // Empresa
  businessTypeId: string;
  name: string;
  legalName?: string | null;
  tradeName?: string | null;
  documentTypeId?: string | null;
  documentNumber?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  statusId?: string | null;
  slug: string;
  // Dueño (persona)
  ownerDocumentTypeId: string;
  ownerDocumentNumber: string;
  ownerFirstName: string;
  ownerSecondName?: string | null;
  ownerFirstLastName: string;
  ownerSecondLastName?: string | null;
  ownerGenderId?: string | null;
  ownerBirthDate?: string | null;
  ownerUserId?: string | null;
}

export interface ProvisionResponse {
  businessId: string;
  slug: string;
  thirdPartyId: string;
  businessOwnerId: string;
}
