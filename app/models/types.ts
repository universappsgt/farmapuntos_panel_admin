export interface Laboratory  {
  id: string;
  name: string;
  location: string;
  specialization: string;
  contactNumber: string;
}

export interface User {
  id: string;
  email: string;
  backgroundPictureUrl: string;
  isAgent: boolean;
  isEnabled: boolean;
  laboratories: string[];
  name: string;
  notificationTokens: string[];
  phoneNumber: string;
  points: number;
  profilePictureUrl: string;
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
  rewardedPoints: number;
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
