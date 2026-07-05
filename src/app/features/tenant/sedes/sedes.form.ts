/** Estado del formulario de sede (alta/edición). Vive separado del componente
 *  para que cada archivo conserve un solo propósito. */
export interface BranchForm {
  branchTypeId: string | null;
  name: string;
  code: string;
  municipalityId: string | null;
  neighborhoodId: string | null;
  addressLine: string;
  phone: string;
  isMain: boolean;
}

export const EMPTY_BRANCH_FORM: BranchForm = {
  branchTypeId: null,
  name: '',
  code: '',
  municipalityId: null,
  neighborhoodId: null,
  addressLine: '',
  phone: '',
  isMain: false,
};
