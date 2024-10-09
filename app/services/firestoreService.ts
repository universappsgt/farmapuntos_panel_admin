import { db } from 'firebase'; // Ensure you have your Firebase config imported
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Fetch documents from a collection
export async function fetchDocuments<T>(collectionName: string): Promise<T[]> {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  const data = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    // Type assertion to include id in the T object
  } as T & { id: string }));
  return data;
}

// Add a new document to a collection
export async function createDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
}

// Update an existing document in a collection
export async function updateDocument<T>(collectionName: string, id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
  const documentRef = doc(db, collectionName, id); // Ensure the document reference includes both collection and document ID
  await updateDoc(documentRef, data);
}

// Delete a document from a collection
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const documentRef = doc(db, collectionName, id);
  await deleteDoc(documentRef);
}


