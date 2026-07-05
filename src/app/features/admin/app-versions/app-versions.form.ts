/** Estado del formulario de subida de una versión del APK. */
export interface UploadForm {
  file: File | null;
  version: string;
  versionCode: string;
  notes: string;
  publish: boolean;
}

export const EMPTY_UPLOAD_FORM: UploadForm = {
  file: null,
  version: '',
  versionCode: '',
  notes: '',
  publish: true,
};
