/**
 * Empleado con el nombre de la persona ya resuelto (lista del dueño).
 * Cargo/fecha/nombre pueden venir vacíos: el alta mínima crea "shells" que el
 * empleado completa desde el APK.
 */
export interface EmployeeDetail {
  id: string;
  thirdPartyId: string;
  personName: string;
  /** Foto de perfil del tercero (la sube el empleado desde el APK). */
  photoUrl?: string | null;
  branchId: string;
  positionId: string | null;
  specialtyId?: string | null;
  hireDate: string | null;
  terminationDate?: string | null;
  statusId?: string | null;
  enabled?: boolean;
}

export interface EmployeePayload {
  thirdPartyId: string;
  branchId: string;
  positionId: string;
  specialtyId?: string | null;
  hireDate: string;
  terminationDate?: string | null;
  statusId?: string | null;
}

/**
 * Alta MÍNIMA de un empleado por el dueño: solo la cuenta (rol EMPLOYEE). El
 * back crea tercero y registro laboral como shells (solo FKs) y el empleado
 * completa sus datos en su primer ingreso al APK.
 */
export interface EmployeeProvisionPayload {
  branchId: string;
  username: string;
  email: string;
  password: string;
}

export interface EmployeeProvisionResult {
  employeeId: string;
  thirdPartyId: string;
  userId: string;
  username: string;
}
