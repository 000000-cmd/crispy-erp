/** Empleado con el nombre de la persona ya resuelto (lista del dueño). */
export interface EmployeeDetail {
  id: string;
  thirdPartyId: string;
  personName: string;
  branchId: string;
  positionId: string;
  employeeCode?: string | null;
  hireDate: string;
  terminationDate?: string | null;
  statusId?: string | null;
  enabled?: boolean;
}

export interface EmployeePayload {
  thirdPartyId: string;
  branchId: string;
  positionId: string;
  employeeCode?: string | null;
  hireDate: string;
  terminationDate?: string | null;
  statusId?: string | null;
}

/**
 * Alta COMPLETA de un empleado por el dueño: crea cuenta (rol EMPLOYEE),
 * persona y registro laboral en una sola llamada. El empleado termina de
 * completar sus datos en su primer ingreso al APK.
 */
export interface EmployeeProvisionPayload {
  // Laboral
  branchId: string;
  positionId: string;
  hireDate: string;
  employeeCode?: string | null;
  // Persona
  documentTypeId: string;
  documentNumber: string;
  firstName: string;
  secondName?: string | null;
  firstLastName: string;
  secondLastName?: string | null;
  genderId?: string | null;
  birthDate?: string | null;
  // Cuenta (para la app móvil)
  email: string;
  username: string;
  password: string;
}

export interface EmployeeProvisionResult {
  employeeId: string;
  thirdPartyId: string;
  userId: string;
  username: string;
}
