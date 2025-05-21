import { db } from "firebase"; // Ensure you have your Firebase config imported
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  WhereFilterOp,
  query,
  where,
  CollectionReference,
  Query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { RewardRequest, Transaction } from "~/models/types";

// Fetch documents from a collection

// add optional query params

export async function fetchDocuments<T>(
  collectionName: string,
  whereClause?: [string, WhereFilterOp, any]
): Promise<T[]> {
  const collectionRef = collection(db, collectionName);
  let q: CollectionReference | Query = collectionRef;

  if (whereClause) {
    q = query(collectionRef, where(...whereClause));
  }

  const snapshot = await getDocs(q);

  const data = snapshot.docs.map((doc) => {
    const docData = doc.data();
    // Parse date fields
    Object.keys(docData).forEach((key) => {
      if (docData[key] && docData[key].toDate instanceof Function) {
        docData[key] = docData[key].toDate();
      }
    });
    return {
      ...docData,
      id: doc.id,
    } as T & { id: string };
  });
  return data;
}

// Fetch a single document from a collection
export async function fetchDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const documentRef = doc(db, collectionName, id);
  const docSnap = await getDoc(documentRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
    } as T & { id: string };
  }
  return null;
}

// Add a new document to a collection
export async function createDocument<T>(
  collectionName: string,
  data: Omit<T, "id">,
  customId?: string
): Promise<[string | null, T | null]> {
  try {
    const collectionRef = collection(db, collectionName);
    let docRef;

    if (customId) {
      docRef = doc(db, collectionName, customId);
      await setDoc(docRef, data);
    } else {
      docRef = await addDoc(collectionRef, data);
    }

    return [null, { ...data, id: docRef.id } as T];
  } catch (error: any) {
    console.error("Error creating document:", error);
    return [error.message || "Error desconocido", null];
  }
}

// Update an existing document in a collection
export async function updateDocument<T>(
  collectionName: string,
  id: string,
  data: Partial<Omit<T, "id">>
): Promise<void> {
  const documentRef = doc(db, collectionName, id); // Ensure the document reference includes both collection and document ID
  await updateDoc(documentRef, data);
}

// Delete a document from a collection
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const documentRef = doc(db, collectionName, id);
  await deleteDoc(documentRef);
}

export async function fetchTransactions(
  collectionName: string,

): Promise<Transaction[]> {
  const collectionRef = collection(db, collectionName);
  let q: CollectionReference | Query = collectionRef;


  q = query(collectionRef, orderBy("createdAt", "desc"));


  const snapshot = await getDocs(q);

  const data = snapshot.docs.map((doc) => {
    const docData = doc.data();
    // Parse date fields
    Object.keys(docData).forEach((key) => {
      if (docData[key] && docData[key].toDate instanceof Function) {
        docData[key] = docData[key].toDate();
      }
    });
    return {
      ...docData,
      id: doc.id,
    } as Transaction & { id: string };
  });
  return data;
}

// Add a new document to a collection
export async function createSubDocument<T>(
  collectionName: string,
  subCollectionName: string,
  data: Omit<T, "id">
): Promise<string> {
  const collectionRef = collection(db, collectionName);
  const subCollectionRef = collection(collectionRef, subCollectionName);
  const docRef = await addDoc(subCollectionRef, data);  
  return docRef.id;
}

export async function fetchRewardRequests(
  collectionName: string,

): Promise<RewardRequest[]> {
  const collectionRef = collection(db, collectionName);
  let q: CollectionReference | Query = collectionRef;


  q = query(collectionRef, orderBy("createdAt", "desc"));


  const snapshot = await getDocs(q);

  const data = snapshot.docs.map((doc) => {
    const docData = doc.data();
    // Parse date fields
    Object.keys(docData).forEach((key) => {
      if (docData[key] && docData[key].toDate instanceof Function) {
        docData[key] = docData[key].toDate();
      }
    });
    return {
      ...docData,
      id: doc.id,
    } as RewardRequest & { id: string };
  });
  return data;
}