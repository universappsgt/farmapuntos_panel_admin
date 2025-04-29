export interface Laboratory {
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
  isAgent: boolean;
  accountStatus: "active" | "inactive" | "newAccount";
}

export interface UserCard {
  id: string;
  userId: string;
  fidelityCardId: string;
  points: number;
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
  status: "active" | "inactive" | "completed";
  minimumPassingPercentage: number;
  worthPoints: number;
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

export namespace TransactionStatus {
  export function getName(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.InProgress:
        return "En progreso";
      case TransactionStatus.Approved:
        return "Aprobada";
      case TransactionStatus.Denied:
        return "Denegada";
      default:
        return "Desconocido";
    }
  }

  export function getVariant(status: TransactionStatus): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case TransactionStatus.InProgress:
        return "secondary";
      case TransactionStatus.Approved:
        return "default";
      case TransactionStatus.Denied:
        return "destructive";
      default:
        return "outline";
    }
  }

  export function fromValue(value: string): TransactionStatus {
    switch (value) {
      case "inProgress":
        return TransactionStatus.InProgress;
      case "approved":
        return TransactionStatus.Approved;
      case "denied":
        return TransactionStatus.Denied;
      default:
        return TransactionStatus.InProgress;
    }
  }
}

export enum TransactionType {
  Credit = "credit",
  Debit = "debit",
}

export namespace TransactionType {
  export function getName(type: TransactionType): string {
    switch (type) {
      case TransactionType.Credit:
        return "Crédito";
      case TransactionType.Debit:
        return "Débito";
    }
  }
}

export interface Transaction {
  id: string;
  createdAt: Date;
  userId: string | null;
  agentId: string | null;
  agentSignatureUrl: string | null;
  userSignatureUrl: string | null;
  evidenceImageUrl: string | null;
  status: TransactionStatus;
  type: TransactionType;
  agent: User;
  user: User;
  points?: number;
  pharmacyBranch?: string;
  backgroundPictureUrl?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  department?: string;
  municipality?: string;
  accountStatus?: string;
  requestRewards?: string[];
}

export interface Reward {
  id: string;
  imageUrl: string;
  name: string;
  expirationDate: Date;
  requestedPoints: number;
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
