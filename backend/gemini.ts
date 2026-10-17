import { GoogleGenAI, ThinkingLevel } from '@google/genai';

console.log('🔥🔥🔥 NEW GEMINI.TS LOADED 🔥🔥🔥');

/* =========================================================
   GEMINI SETUP
   ========================================================= */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY is not configured. Create backend/.env from backend/.env.example.'
  );
}

export const ai = new GoogleGenAI({
  apiKey,
});

/*
 * Main Gemini model.
 *
 * backend/.env should contain:
 *
 * GEMINI_MODEL=gemini-3.8-flash
 */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  'gemini-3.8-flash';

console.log(
  '🔥 GEMINI_MODEL =',
  GEMINI_MODEL
);

/* =========================================================
   PRESCRIPTION RESPONSE SHAPE
   ========================================================= */

export const prescriptionSchema = {
  type: 'object',

  properties: {
    doctorName: {
      type: 'string',
    },

    patientName: {
      type: 'string',
    },

    date: {
      type: 'string',
    },

    diagnosis: {
      type: 'string',
    },

    category: {
      type: 'string',
    },

    medicines: {
      type: 'array',

      items: {
        type: 'object',

        properties: {
          name: {
            type: 'string',
          },

          genericName: {
            type: 'string',
          },

          isGeneric: {
            type: 'boolean',
          },

          dosage: {
            type: 'string',
          },

          frequency: {
            type: 'string',
          },

          duration: {
            type: 'string',
          },

          timing: {
            type: 'string',
          },

          category: {
            type: 'string',
          },

          purpose: {
            type: 'string',
          },

          sideEffects: {
            type: 'array',
            items: {
              type: 'string',
            },
          },

          precautions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },

          interactions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },

          allergyWarnings: {
            type: 'array',
            items: {
              type: 'string',
            },
          },

          replacements: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },

    instructions: {
      type: 'array',
      items: {
        type: 'string',
      },
    },

    warnings: {
      type: 'array',
      items: {
        type: 'string',
      },
    },

    drugInteractions: {
      type: 'array',

      items: {
        type: 'object',

        properties: {
          drug1: {
            type: 'string',
          },

          drug2: {
            type: 'string',
          },

          severity: {
            type: 'string',
          },

          description: {
            type: 'string',
          },
        },
      },
    },

    duplicateMedicines: {
      type: 'array',

      items: {
        type: 'string',
      },
    },

    testsAndExaminations: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      details: {
        type: 'string',
      },
      timing: {
        type: 'string',
      },
    },
    required: [
      'name',
      'details',
      'timing',
    ],
  },
},

    summary: {
      type: 'string',
    },

    summaryHindi: {
      type: 'string',
    },
  },
} as const;

/* =========================================================
   PRESCRIPTION PROMPT
   ========================================================= */

export const PRESCRIPTION_PROMPT = `
You are GetMedGo's prescription-reading assistant.

Read the prescription image exactly as written.

PRIMARY GOAL:
Extract the information that is visibly written on the prescription.
Do NOT infer, normalize, substitute, or invent information.

Return ONE complete JSON object with these keys:

doctorName
patientName
date
diagnosis
category
medicines
instructions
testsAndExaminations
warnings
drugInteractions
duplicateMedicines
summary
summaryHindi

Each medicine must contain:

name
genericName
isGeneric
dosage
quantity
frequency
duration
timing
category
purpose
sideEffects
precautions
interactions
allergyWarnings
replacements

IMPORTANT EXTRACTION RULES:

- Preserve the prescription's wording whenever possible.
- Preserve the written date exactly as it appears.
- Do NOT replace the prescription date with today's date.
- Do NOT convert a date into today's date.
- Preserve dosage exactly as written.
- Preserve frequency exactly as written.
- Preserve duration exactly as written.
- Preserve timing exactly as written.
- Extract quantity if written.
- Do NOT use "Any time" unless the prescription actually says that.
- Do NOT use "As directed" unless the prescription actually says that.
- Do NOT use "Unknown" when information is unclear.
- If handwriting cannot be confidently read, use an empty string and mention the uncertainty in warnings.
- Never invent a diagnosis.
- Never invent a doctor name.
- Never invent a patient name.
- Never invent medical instructions.
- Never silently correct handwriting.

Return ONLY valid JSON.
Do NOT use markdown code fences.
Do NOT include explanations outside the JSON.

Use simple patient-friendly language.
Include a Hindi summary in Devanagari when possible.

TESTS AND EXAMINATIONS:

Look specifically for any laboratory test, diagnostic test, imaging study,
physical examination, or follow-up examination explicitly written on the
prescription.

Examples include:
- CBC
- Blood glucose
- HbA1c
- Lipid profile
- LFT
- KFT
- Urine test
- X-ray
- ECG
- Ultrasound
- CT scan
- MRI
- Physical examination
- Follow-up examination

CRITICAL RULE:

Only extract tests or examinations that are actually written or clearly
visible on the prescription.

Do NOT recommend a test merely because it is commonly associated with a
medicine, diagnosis, age, or condition.

Do NOT infer a test.

If no test or examination is written, return an empty array.

For each extracted test/examination return:
- name
- details
- timing

Preserve the wording from the prescription whenever possible.
`;



/* =========================================================
   IMAGE VALIDATION
   ========================================================= */

function validateImage(
  buffer: Buffer,
  mimeType: string
) {
  if (!buffer || buffer.length === 0) {
    throw new Error(
      'The uploaded image is empty.'
    );
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(
      `Unsupported image MIME type: ${mimeType}`
    );
  }

  console.log(
    `🖼️ Gemini image: ${mimeType}, ${buffer.length} bytes`
  );
}

/* =========================================================
   TEMPORARY GEMINI ERROR CHECK
   ========================================================= */

function isTemporaryGeminiError(
  error: unknown
) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('temporarily') ||
    message.includes('service unavailable') ||
    message.includes('overloaded')
  );
}

/* =========================================================
   SLEEP
   ========================================================= */

function sleep(
  milliseconds: number
) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/* =========================================================
   NORMALIZE PRESCRIPTION RESULT
   ========================================================= */

function normalizePrescription(
  data: any
) {
  const medicines = Array.isArray(data?.medicines)
    ? data.medicines
    : [];

  return {
    doctorName:
      typeof data?.doctorName === 'string'
        ? data.doctorName
        : '',

    patientName:
      typeof data?.patientName === 'string'
        ? data.patientName
        : '',

    date:
      typeof data?.date === 'string'
        ? data.date
        : '',

    diagnosis:
      typeof data?.diagnosis === 'string'
        ? data.diagnosis
        : '',

    category:
      typeof data?.category === 'string'
        ? data.category
        : '',

    medicines: medicines.map(
      (medicine: any) => ({
        name:
          typeof medicine?.name === 'string'
            ? medicine.name
            : '',

        genericName:
          typeof medicine?.genericName === 'string'
            ? medicine.genericName
            : '',

        isGeneric:
          typeof medicine?.isGeneric === 'boolean'
            ? medicine.isGeneric
            : false,

        dosage:
          typeof medicine?.dosage === 'string'
            ? medicine.dosage
            : '',

        frequency:
          typeof medicine?.frequency === 'string'
            ? medicine.frequency
            : '',

        duration:
          typeof medicine?.duration === 'string'
            ? medicine.duration
            : '',

        timing:
          typeof medicine?.timing === 'string'
            ? medicine.timing
            : '',

        category:
          typeof medicine?.category === 'string'
            ? medicine.category
            : '',

        purpose:
          typeof medicine?.purpose === 'string'
            ? medicine.purpose
            : '',

        sideEffects:
          Array.isArray(medicine?.sideEffects)
            ? medicine.sideEffects.filter(
                (item: unknown) =>
                  typeof item === 'string'
              )
            : [],

        precautions:
          Array.isArray(medicine?.precautions)
            ? medicine.precautions.filter(
                (item: unknown) =>
                  typeof item === 'string'
              )
            : [],

        interactions:
          Array.isArray(medicine?.interactions)
            ? medicine.interactions.filter(
                (item: unknown) =>
                  typeof item === 'string'
              )
            : [],

        allergyWarnings:
          Array.isArray(medicine?.allergyWarnings)
            ? medicine.allergyWarnings.filter(
                (item: unknown) =>
                  typeof item === 'string'
              )
            : [],

        replacements:
          Array.isArray(medicine?.replacements)
            ? medicine.replacements.filter(
                (item: unknown) =>
                  typeof item === 'string'
              )
            : [],
      })
    ),

    instructions:
      Array.isArray(data?.instructions)
        ? data.instructions.filter(
            (item: unknown) =>
              typeof item === 'string'
          )
        : [],

    warnings:
      Array.isArray(data?.warnings)
        ? data.warnings.filter(
            (item: unknown) =>
              typeof item === 'string'
          )
        : [],

    drugInteractions:
      Array.isArray(data?.drugInteractions)
        ? data.drugInteractions
            .filter(
              (item: any) =>
                item &&
                typeof item === 'object'
            )
            .map(
              (item: any) => ({
                drug1:
                  typeof item.drug1 === 'string'
                    ? item.drug1
                    : '',

                drug2:
                  typeof item.drug2 === 'string'
                    ? item.drug2
                    : '',

                severity:
                  typeof item.severity === 'string'
                    ? item.severity
                    : '',

                description:
                  typeof item.description === 'string'
                    ? item.description
                    : '',
              })
            )
        : [],

    duplicateMedicines:
      Array.isArray(data?.duplicateMedicines)
        ? data.duplicateMedicines.filter(
            (item: unknown) =>
              typeof item === 'string'
          )
        : [],

    summary:
      typeof data?.summary === 'string'
        ? data.summary
        : '',

    summaryHindi:
      typeof data?.summaryHindi === 'string'
        ? data.summaryHindi
        : '',
  };
}

/* =========================================================
   PRESCRIPTION IMAGE ANALYSIS
   ========================================================= */

export async function analyzeImage(buffer: Buffer, mimeType: string) {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Gemini analysis attempt ${attempt}/${maxAttempts}...`);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            inlineData: {
              mimeType,
              data: buffer.toString('base64'),
            },
          },
          { text: PRESCRIPTION_PROMPT },
        ],
      });

      const text = response.text?.trim();

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      console.log('Gemini raw response:', text);

     const cleanedText = text
  .replace(/^```json\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();

const parsed = JSON.parse(cleanedText);

if (
  !parsed ||
  typeof parsed !== 'object' ||
  !Array.isArray(parsed.medicines) ||
  !Array.isArray(parsed.instructions) ||
  !Array.isArray(parsed.warnings) ||
  !Array.isArray(parsed.drugInteractions) ||
  !Array.isArray(parsed.duplicateMedicines) ||
  typeof parsed.summary !== 'string'
) {
  throw new Error('Gemini returned an incomplete prescription analysis.');
}

return parsed;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      const is503 =
        message.includes('503') ||
        message.includes('UNAVAILABLE') ||
        message.includes('high demand');

      console.error(
        `Gemini attempt ${attempt} failed:`,
        message
      );

      // Don't retry permanent/client errors.
      if (!is503 || attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff + a little randomness.
      const delay =
        Math.min(1000 * Math.pow(2, attempt - 1), 8000) +
        Math.floor(Math.random() * 1000);

      console.log(
        `Gemini is temporarily unavailable. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Gemini analysis failed after multiple attempts.');
}

/* =========================================================
   CHAT
   ========================================================= */

export async function chat(
  prompt: string
) {
  console.log(
    `💬 Chat request using ${GEMINI_MODEL}`
  );

  const response =
    await ai.models.generateContent({
      model: GEMINI_MODEL,

      contents: prompt,

      config: {
        thinkingConfig: {
          thinkingLevel:
            ThinkingLevel.LOW,
        },
      },
    });

  return (
    response.text?.trim() ||
    'Sorry, I could not process that. Please try again.'
  );
}

/* =========================================================
   MEDICINE SEARCH
   ========================================================= */

export async function medicineSearch(
  query: string
) {
  console.log(
    `💊 Medicine search using ${GEMINI_MODEL}`
  );

  const response =
    await ai.models.generateContent({
      model: GEMINI_MODEL,

      contents: `
Give concise, patient-friendly general information
about the medicine:

"${query}"

IMPORTANT:

- Do not prescribe an individual dose.
- Do not recommend changing a prescription.
- Do not invent information.
- Exact dosage depends on the prescription and patient factors.
- If the medicine name is unclear, say so.

Return JSON only using this structure:

{
  "name": "",
  "genericName": "",
  "category": "",
  "uses": [],
  "sideEffects": [],
  "precautions": [],
  "dosageInfo": "",
  "interactions": [],
  "alternatives": []
}
`,

      config: {
        responseMimeType:
          'application/json',

        responseSchema: {
          type: 'object',

          properties: {
            name: {
              type: 'string',
            },

            genericName: {
              type: 'string',
            },

            category: {
              type: 'string',
            },

            uses: {
              type: 'array',

              items: {
                type: 'string',
              },
            },

            sideEffects: {
              type: 'array',

              items: {
                type: 'string',
              },
            },

            precautions: {
              type: 'array',

              items: {
                type: 'string',
              },
            },

            dosageInfo: {
              type: 'string',
            },

            interactions: {
              type: 'array',

              items: {
                type: 'string',
              },
            },

            alternatives: {
              type: 'array',

              items: {
                type: 'string',
              },
            },
          },

          required: [
            'name',
            'genericName',
            'category',
            'uses',
            'sideEffects',
            'precautions',
            'dosageInfo',
            'interactions',
            'alternatives',
          ],
        },
      },
    });

  if (!response.text) {
    throw new Error(
      'Gemini returned an empty medicine result.'
    );
  }

  return JSON.parse(
    response.text
  );
}