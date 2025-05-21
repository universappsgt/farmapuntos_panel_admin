import { storage } from "firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export async function uploadImage(buffer: Buffer, filename: string, path: string): Promise<string> {
  // Obtener el tipo MIME del archivo
  const fileType = filename.split('.').pop()?.toLowerCase();
  const mimeType = `image/${fileType}`;

  // Validar que sea un tipo de imagen permitido
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error(`Tipo de archivo no permitido. Solo se permiten imágenes (${ALLOWED_IMAGE_TYPES.join(', ')})`);
  }

  const storageRef = ref(storage, `${path}/${Date.now()}_${filename}`);
  
  // Agregar metadatos de tipo de imagen
  const metadata = {
    contentType: mimeType,
    customMetadata: {
      'uploadedAt': new Date().toISOString(),
      'fileType': fileType || 'unknown'
    }
  };

  await uploadBytes(storageRef, buffer, metadata);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
