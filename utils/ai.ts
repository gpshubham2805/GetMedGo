import type {
  ChatMessage,
  MedicineSearchResult,
  PrescriptionResult,
} from '@/types/prescription';

import {
  analyzePrescriptionImage,
  chatWithBackend,
  searchMedicineBackend,
} from '@/utils/api';

/**
 * GetMedGo AI service
 *
 * IMPORTANT:
 * Gemini is NOT called directly from the Expo app.
 * All AI requests go through the GetMedGo backend.
 */

// ---------------------------------------------------------
// PRESCRIPTION ANALYSIS
// ---------------------------------------------------------

export async function analyzePrescription(
  imageUri: string
): Promise<PrescriptionResult> {
  try {
    const result = await analyzePrescriptionImage(imageUri);

    return result as PrescriptionResult;
  } catch (error) {
    console.error('Prescription analysis error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to analyze prescription.');
  }
}

// ---------------------------------------------------------
// AI CHAT
// ---------------------------------------------------------

export async function chatWithAI(
  message: string,
  prescription: PrescriptionResult | null,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const context = {
      prescription,
      history,
    };

    const reply = await chatWithBackend(message, context);

    return reply;
  } catch (error) {
    console.error('AI chat error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to get AI response.');
  }
}

// ---------------------------------------------------------
// MEDICINE SEARCH
// ---------------------------------------------------------

export async function searchMedicine(
  query: string
): Promise<MedicineSearchResult[]> {
  try {
    const result = await searchMedicineBackend(query);

    if (Array.isArray(result)) {
      return result as MedicineSearchResult[];
    }

    if (Array.isArray(result?.results)) {
      return result.results as MedicineSearchResult[];
    }

    return [];
  } catch (error) {
    console.error('Medicine search error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to search medicine.');
  }
}

// ---------------------------------------------------------
// MOCK RESULT
// ---------------------------------------------------------
// Kept here so the rest of the app does not break if another
// screen imports getMockResult().
//
// The real scan flow should use analyzePrescription() above.
// ---------------------------------------------------------

export function getMockResult(imageUri: string): PrescriptionResult {
  return {
    id: `mock-${Date.now()}`,
    imageUri,

    doctorName: 'Dr. Sharma',
    patientName: 'Patient',

    date: new Date().toISOString(),

    diagnosis: 'Common infection',

    medicines: [
      {
        name: 'Amoxicillin',
        dosage: '500 mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after food',
      },
      {
        name: 'Paracetamol',
        dosage: '500 mg',
        frequency: 'As needed',
        duration: '3 days',
        instructions: 'Take for fever or pain',
      },
    ],

    instructions: [
      'Take medicines exactly as prescribed.',
      'Complete the full course of antibiotics.',
      'Drink plenty of water and rest.',
    ],

    warnings: [
      'Do not stop antibiotics early unless advised by your doctor.',
      'Check with a doctor or pharmacist if you have allergies.',
    ],

    summary:
      'The prescription contains medicines for treating a common infection and associated fever or pain.',

    summaryHindi:
      'यह प्रिस्क्रिप्शन सामान्य संक्रमण और उससे जुड़े बुखार या दर्द के इलाज के लिए दवाइयां बताता है।',

    rawText: 'Mock prescription result',

    analyzedAt: new Date().toISOString(),

    category: 'General',

    drugInteractions: [],

    duplicateMedicines: [],
  };
}