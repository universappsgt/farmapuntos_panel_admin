export interface Laboratory  {
  id: string;
  name: string;
  location: string;
  specialization: string;
  contactNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  phoneNumber: string;
  profilePictureUrl: string;
  notificationTokens: string[];
  backgroundPictureUrl: string;
  isEnabled: boolean;
  isAgent: boolean;
}

export interface FidelityCard {
  id: string;
  cardTitle: string;
  cardDesign: {
    backgroundImage: string;
    logo: string;
    
  };
  contact: {
    locationUrl: string;
    phoneNumber: string;
    website: string;
  };
  description: string;
  laboratoryId: string;
  rules: {
    currency: string;
    forPurchasePrice: number;
    initialCredits: number;
    rewardPoints: string;
    status: string;
  };
}

export interface Survey {
  id: string;
  title: string;
  videoUrl: string;
  deadline: Date;
  cardId: string;
  createdAt: Date;
  description: string;
  awardedPoints: number;
  status: 'active' | 'inactive' | 'completed';
}

export interface Question {
  id: string;
  questionText: string;
  correctAnswer: string;
  correctAnswerIndex: number;
  answers: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TransactionStatus {
  InProgress = "inProgress",
  Approved = "approved",
  Denied = "denied",
}

export enum TransactionType {
  Credit = "credit",
  Debit = "debit",
}

export interface Transaction {
  id: string;
  createdAt: Date;
  userId: string;
  agentId: string;
  agentSignatureUrl: string;
  clientSignatureUrl: string;
  evidenceImageUrl: string;
  rewardPoins: number;
  transactionStatus: TransactionStatus;
  transactionType: TransactionType;
  agent: User; // Ensure this field is present
  client: User; // Ensure this field is present
}

export interface Reward {
  id: string;
  imageUrl: string;
  name: string;
  expirationDate: Date;
  awardedPoints: number;
  stock: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  awardedPoints: number;
}
