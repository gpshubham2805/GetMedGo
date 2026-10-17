import 'dotenv/config';
import fs from 'fs';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const imagePath = 'C:\\Users\\gpshu\\Desktop\\prescription.webp';

try {
  console.log('Reading prescription image...');

  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');

  console.log('Image size:', imageBuffer.length, 'bytes');
  console.log('Sending image to OpenAI...');

  const response = await client.responses.create({
    model: 'gpt-5.5',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Read this prescription image. Tell me the medicine name, strength, quantity, and directions exactly as written. Do not guess unclear handwriting.',
          },
          {
            type: 'input_image',
            image_url: `data:image/webp;base64,${base64}`,
          },
        ],
      },
    ],
  });

  console.log('\n===== OPENAI RESULT =====');
  console.log(response.output_text);
  console.log('=========================\n');

} catch (error) {
  console.error('\n===== OPENAI TEST FAILED =====');
  console.error(error);
}