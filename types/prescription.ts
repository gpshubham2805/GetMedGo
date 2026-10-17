export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
  purpose?: string;
  sideEffects?: string[];
  precautions?: string[];
  genericName?: string;
  brandName?: string;
  isGeneric?: boolean;
  category?: string; // antibiotic, painkiller, etc.
  interactions?: string[];
  allergyWarnings?: string[];
  replacements?: string[]; // generic alternatives
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface PrescriptionResult {
  id: string;
  imageUri: string;
  doctorName?: string;
  patientName?: string;
  date: string;
  diagnosis?: string;
  medicines: Medicine[];
  instructions?: string[];
  warnings?: string[];
  testsAndExaminations: TestAndExamination[];
  summary: string;
  summaryHindi?: string;
  rawText?: string;
  analyzedAt: string;
  category?: string; // general, cardiology, dermatology, etc.
  expiryDate?: string;
  drugInteractions?: DrugInteraction[];
  duplicateMedicines?: string[];
}

export interface ScanHistoryItem {
  id: string;
  imageUri: string;
  summary: string;
  medicineCount: number;
  date: string;
  analyzedAt: string;
  category?: string;
  diagnosis?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TestAndExamination {
  name: string;
  details: string;
  timing: string;
}

export interface MedicineSearchResult {
  name: string;
  genericName: string;
  category: string;
  uses: string[];
  sideEffects: string[];
  precautions: string[];
  dosageInfo: string;
  interactions: string[];
  alternatives: string[];
}

export interface AppSettings {
  language: 'en' | 'hi';
  largeText: boolean;
  simpleMode: boolean;
  ttsEnabled: boolean;
}
