import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PrescriptionResult,
  ScanHistoryItem,
  ChatMessage,
  AppSettings,
} from '@/types/prescription';

const HISTORY_KEY = 'getmedgo_scan_history';
const ONBOARDING_KEY = 'getmedgo_onboarding_done';
const SETTINGS_KEY = 'getmedgo_settings';
const CHAT_KEY = 'getmedgo_chat_history';
const ACTIVE_PRESCRIPTION_KEY = 'getmedgo_active_prescription';

function getValidDate(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string' && typeof value !== 'number') {
      continue;
    }

    if (value === '') continue;

    const timestamp = new Date(value).getTime();

    if (Number.isFinite(timestamp)) {
      return new Date(timestamp).toISOString();
    }
  }

  return new Date().toISOString();
}

// --- Scan Results ---
export async function saveScanResult(
  result: PrescriptionResult
): Promise<void> {
  try {
    const scanId =
      result.id ||
      `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const analyzedAt = getValidDate(result.analyzedAt, result.date);

    const safeResult: PrescriptionResult = {
      ...result,
      id: scanId,
      date: getValidDate(result.date, analyzedAt),
      analyzedAt,
    };

    const existing = await getScanHistory();

    const historyItem: ScanHistoryItem = {
      id: scanId,
      imageUri: safeResult.imageUri,
      summary: safeResult.summary,
      medicineCount: safeResult.medicines.length,
      date: safeResult.date,
      analyzedAt: safeResult.analyzedAt,
      category: safeResult.category,
      diagnosis: safeResult.diagnosis,
    };

    const updated = [
      historyItem,
      ...existing.filter((item) => item.id !== scanId),
    ];

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(
      `scan_${scanId}`,
      JSON.stringify(safeResult)
    );

    await setActivePrescription(scanId);
  } catch (error) {
    console.error('Error saving scan result:', error);
  }
}

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    if (!data) return [];

    const history: ScanHistoryItem[] = JSON.parse(data);

    if (!Array.isArray(history)) return [];

    // Repair old history entries using their saved scan result where possible.
    const repaired = await Promise.all(
      history.map(async (item) => {
        let savedResult: PrescriptionResult | null = null;

        try {
          const resultData = await AsyncStorage.getItem(`scan_${item.id}`);
          if (resultData) {
            savedResult = JSON.parse(resultData);
          }
        } catch {
          // Continue with the history item's own fields.
        }

        const date = getValidDate(
          item.analyzedAt,
          item.date,
          savedResult?.analyzedAt,
          savedResult?.date
        );

        return {
          ...item,
          date: getValidDate(item.date, date),
          analyzedAt: date,
        };
      })
    );

    // Persist repaired dates so they remain available next time.
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(repaired));

    return repaired;
  } catch (error) {
    console.error('Error loading scan history:', error);
    return [];
  }
}

export async function getScanResult(
  id: string
): Promise<PrescriptionResult | null> {
  try {
    const data = await AsyncStorage.getItem(`scan_${id}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function deleteScanResult(id: string): Promise<void> {
  try {
    const history = await getScanHistory();
    const filtered = history.filter((item) => item.id !== id);

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    await AsyncStorage.removeItem(`scan_${id}`);

    const activeId = await AsyncStorage.getItem(ACTIVE_PRESCRIPTION_KEY);

    if (activeId === id) {
      if (filtered.length > 0) {
        await setActivePrescription(filtered[0].id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_PRESCRIPTION_KEY);
      }
    }
  } catch (error) {
    console.error('Error deleting scan result:', error);
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const history = await getScanHistory();

    for (const item of history) {
      await AsyncStorage.removeItem(`scan_${item.id}`);
    }

    await AsyncStorage.removeItem(HISTORY_KEY);
    await AsyncStorage.removeItem(ACTIVE_PRESCRIPTION_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// --- Active Prescription (for chatbot context) ---
export async function setActivePrescription(id: string): Promise<void> {
  if (!id) {
    console.warn('setActivePrescription skipped: missing prescription ID');
    return;
  }

  await AsyncStorage.setItem(ACTIVE_PRESCRIPTION_KEY, id);
}

export async function getActivePrescription(): Promise<PrescriptionResult | null> {
  try {
    const id = await AsyncStorage.getItem(ACTIVE_PRESCRIPTION_KEY);
    if (!id) return null;

    return getScanResult(id);
  } catch {
    return null;
  }
}

// --- Chat History ---

/** --- Chat History --- **/

const GENERAL_CHAT_KEY = 'getmedgo_chat_history_general';

function getChatKey(contextId?: string | null): string {
  return contextId
    ? `getmedgo_chat_history_${contextId}`
    : GENERAL_CHAT_KEY;
}

export async function saveChatHistory(
  messages: ChatMessage[],
  contextId?: string | null
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      getChatKey(contextId),
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error('Error saving chat:', error);
  }
}

export async function getChatHistory(
  contextId?: string | null
): Promise<ChatMessage[]> {
  try {
    const data = await AsyncStorage.getItem(getChatKey(contextId));
    if (!data) return [];

    const messages: ChatMessage[] = JSON.parse(data);
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error('Error loading chat:', error);
    return [];
  }
}

export async function clearChatHistory(
  contextId?: string | null
): Promise<void> {
  try {
    await AsyncStorage.removeItem(getChatKey(contextId));
  } catch (error) {
    console.error('Error clearing chat:', error);
  }
}


// --- Onboarding ---
export async function isOnboardingDone(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

// --- Settings ---
export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  largeText: false,
  simpleMode: false,
  ttsEnabled: false,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);

    return data
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: Partial<AppSettings>
): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };

    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}