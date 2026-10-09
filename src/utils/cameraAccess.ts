export type CameraAccess = {
  title: string;
  body: string;
  next: 'allow' | 'settings';
};

export function cameraAccessCopy(canAskAgain: boolean): CameraAccess {
  if (canAskAgain) {
    return {
      title: 'Camera access is needed',
      body: 'IngreCheck reads barcodes on your device. Photos are not uploaded. You can also type a barcode or search by name.',
      next: 'allow',
    };
  }
  return {
    title: 'Camera access is off',
    body: 'Camera access is off. To scan, allow the camera in Settings. You can also type a barcode or search by name. Photos are not uploaded.',
    next: 'settings',
  };
}
