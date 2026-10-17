import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeImageWithOpenAI(
  imageBuffer: Buffer,
  mimeType: string
) {
  const base64 = imageBuffer.toString('base64');

  console.log('🤖 OpenAI fallback started');
  console.log('📦 Image size:', imageBuffer.length, 'bytes');
  console.log('🖼️ MIME type:', mimeType);

  const response = await openai.responses.create({
    model: 'gpt-5.5',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `
Read this prescription image carefully.

Extract:
- doctor name
- patient name
- prescription date
- diagnosis if clearly written
- medicine name
- generic name
- strength/dosage
- frequency
- duration
- quantity
- instructions
- warnings

Do not guess unclear handwriting.
If something cannot be read, leave it blank or say unclear.

Return the information as JSON.
            `,
          },
          {
            type: 'input_image',
            image_url: `data:${mimeType};base64,${base64}`,
          },
        ],
      },
    ],
  });

  console.log('✅ OpenAI response received');

  const text = response.output_text?.trim();

  if (!text) {
    throw new Error('OpenAI returned an empty response.');
  }

  console.log('📄 OpenAI response:', text.slice(0, 3000));

  return text;
}