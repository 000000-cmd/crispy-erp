/** Versión del APK en el histórico (espejo de AppVersionResponse). */
export interface AppVersion {
  id: string;
  version: string;
  versionCode: number;
  fileName: string;
  checksum: string;
  sizeBytes: number;
  notes?: string | null;
  isCurrent: boolean;
  enabled: boolean;
  visible: boolean;
  createdDate?: string;
  auditDate?: string;
}

export interface AppVersionUpload {
  file: File;
  version: string;
  versionCode: number;
  notes?: string;
  publish: boolean;
}
