// Passenger profile stored in profiles.metadata.passengerProfile
export interface PassengerProfile {
  passengerName: string;
  passengerEmail: string;
  rg: string;
  rgIssuer: string;
  cpf: string;
  birthDate: string; // ISO date string
  phone: string;
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  savedAt?: string; // ISO timestamp when profile was last saved
}

// User profile with metadata
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
  metadata?: {
    passengerProfile?: PassengerProfile;
    [key: string]: any;
  };
  created_at?: string;
  last_login?: string;
}
