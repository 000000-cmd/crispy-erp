/**
 * Modelos del dominio Tercero (alineados con thirdparty-service del backend).
 * Un tercero es una PERSONA NATURAL: sus contactos y direcciones viven en
 * tablas 1:N propias. La identidad jurídica (empresa) vive en business.
 */

export interface ThirdParty {
  id: string;
  documentTypeId: string;
  documentNumber: string;
  userId?: string | null;
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  fullName?: string;
  genderId?: string | null;
  birthDate?: string | null;
  photoUrl?: string | null;
  enabled?: boolean;
  visible?: boolean;
  createdDate?: string;
  auditDate?: string;
}

export interface ThirdPartyContact {
  id: string;
  thirdPartyId: string;
  contactTypeId: string;
  value: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  verifiedAt?: string | null;
  notes?: string | null;
  enabled?: boolean;
}

export interface ThirdPartyAddress {
  id: string;
  thirdPartyId: string;
  addressTypeId?: string | null;
  municipalityId: string;
  neighborhoodId?: string | null;
  line?: string;
  reference?: string;
  isPrimary?: boolean;
  enabled?: boolean;
}

/** Respuesta del endpoint /full: info completa y anidada del tercero. */
export interface ThirdPartyDetail {
  thirdParty: ThirdParty;
  contacts: ThirdPartyContact[];
  addresses: ThirdPartyAddress[];
}

export interface ThirdPartyPayload {
  documentTypeId: string;
  documentNumber: string;
  userId?: string | null;
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  genderId?: string | null;
  birthDate?: string | null;
  photoUrl?: string | null;
}

export interface ThirdPartyContactPayload {
  thirdPartyId: string;
  contactTypeId: string;
  value: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  notes?: string;
}

export interface ThirdPartyAddressPayload {
  thirdPartyId: string;
  addressTypeId?: string;
  municipalityId: string;
  neighborhoodId?: string;
  line?: string;
  reference?: string;
  isPrimary?: boolean;
}
