const PHOTO_SIZE = 320;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = /^image\/(jpeg|png|webp)$/;

// Center-crop to a square and shrink, so the saved photo stays small (~20-40 KB)
const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      canvas.getContext('2d').drawImage(
        img,
        (img.width - side) / 2, (img.height - side) / 2, side, side,
        0, 0, PHOTO_SIZE, PHOTO_SIZE
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });

// Validates a picked image file and returns a small square JPEG data URL.
// Throws an Error with a user-friendly message when the file can't be used.
export const prepareProfilePhoto = async (file) => {
  if (!ALLOWED_TYPES.test(file.type)) {
    throw new Error('Please choose a JPEG, PNG or WebP image.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is too large. Please choose one under 8 MB.');
  }
  return resizeImage(file);
};
