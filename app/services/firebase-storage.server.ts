import { storage } from "firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  const storageRef = ref(storage, `profilePics/${Date.now()}_${filename}`);
  await uploadBytes(storageRef, buffer);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
