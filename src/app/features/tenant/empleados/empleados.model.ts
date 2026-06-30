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
