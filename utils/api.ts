import * as FileSystem from 'expo-file-system/legacy';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.129.114.105:8787';

function getApiUrl(path: string) {
  return `${API_URL}${path}`;
}

function getMimeType(imageUri: string) {
  const uri = imageUri.toLowerCase();

  if (uri.endsWith('.png')) {
    return 'image/png';
  }

  if (uri.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

export async function analyzePrescriptionImage(imageUri: string) {
  try {
    console.log('Image URI:', imageUri);

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Base64 length:', base64.length);

    const mimeType = getMimeType(imageUri);

    console.log('Image MIME type:', mimeType);

    const response = await fetch(getApiUrl('/api/analyze'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType,
      }),
    });

    const responseText = await response.text();

    console.log('Analyze HTTP status:', response.status);
    console.log('Analyze response:', responseText.slice(0, 1000));

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend returned non-JSON response (${response.status}): ${responseText.slice(0, 300)}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error || `Prescription analysis failed (${response.status}).`
      );
    }

    return data;
  } catch (error) {
    console.error('Prescription analysis error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to analyze prescription image.');
  }
}


export async function chatWithBackend(
  message: string,
  prescription: unknown,
  history: unknown[] = []
) {
  let response: Response;

  try {
    response = await fetch(getApiUrl('/api/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        prescription,
        history,
      }),
    });
  } catch (error) {
    console.error('Chat network error:', error);
    throw new Error(
      'Cannot connect to the chat server. Check that the backend is running and the API URL is correct.'
    );
  }

  const responseText = await response.text();

  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch {
    console.error(
      'Chat API returned non-JSON:',
      response.status,
      responseText.slice(0, 500)
    );

    throw new Error(
      `Chat server returned an invalid response (${response.status}).`
    );
  }

  console.log('Chat HTTP status:', response.status);

  if (!response.ok) {
    console.error('Chat API error response:', data);

    throw new Error(
      data?.error || `Chat request failed (${response.status}).`
    );
  }

  return data.reply || '';
}


export async function searchMedicineBackend(query: string) {
  const response = await fetch(getApiUrl('/api/medicine/search'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Medicine search failed.');
  }

  return data;
}
