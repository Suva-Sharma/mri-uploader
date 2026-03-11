const ALLOWED_EXT = [".nii", ".nii.gz", ".zip", ".tgz", ".gz"];

export function isAllowedUploadFile(name: string) {
  const lower = name.toLowerCase();
  return ALLOWED_EXT.some((ext) => lower.endsWith(ext));
}

export function allowedHint() {
  return ".nii, .nii.gz, .zip, .tgz, .gz (zip/tgz your DICOM folder)";
}
