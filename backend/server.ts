import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeImage, chat, medicineSearch } from './gemini.js';


const app = express();

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());

// Base64 images can be large.
app.use(express.json({ limit: '50mb' }));

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'getmedgo-backend',
  });
});

// --------------------------------------------------
// PRESCRIPTION ANALYSIS
// --------------------------------------------------

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body ?? {};

    console.log(
      'Analyze request received:',
      imageBase64 ? `${imageBase64.length} base64 chars` : 'NO IMAGE'
    );

    if (!imageBase64) {
      return res.status(400).json({
        error: 'Please upload a prescription image.',
      });
    }

    const imageMimeType =
      typeof mimeType === 'string' && mimeType
        ? mimeType
        : 'image/jpeg';

    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(
        imageMimeType
      )
    ) {
      return res.status(400).json({
        error: 'Unsupported image type.',
      });
    }

    // Convert Base64 back into an image buffer.
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    console.log(
      'Image buffer received:',
      imageBuffer.length,
      'bytes'
    );

    const result = await analyzeImage(
      imageBuffer,
      imageMimeType
    );

    console.log('Prescription analysis completed.');

    // IMPORTANT:
    // Return the result directly because utils/api.ts
    // expects the prescription object directly.
    return res.json(result);
  } catch (error) {
    console.error('Analyze error:', error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Prescription analysis failed.',
    });
  }
});

// --------------------------------------------------
// AI CHAT
// --------------------------------------------------

app.post('/api/chat', async (req, res) => {
  try {
    const { message, prescription } = req.body ?? {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'message is required.',
      });
    }

    const context = prescription
      ? `\nPrescription context:\n${JSON.stringify(
          prescription
        )}\n`
      : '';

    const prompt = `
You are GetMedGo AI Assistant, a medical-information assistant.

${context}

User: ${message.trim()}

Rules:
- Use simple language.
- If the user asks in Hindi, answer in Hindi.
- Never diagnose or prescribe.
- Do not invent missing prescription details.
- For prescription timing questions, use the supplied prescription context only.
- Encourage the user to follow their clinician or pharmacist's instructions for medication decisions.
- If the situation sounds urgent, advise contacting a healthcare professional.
- Be concise.
- End with: "I'm an AI assistant, not a doctor."
`;

    const reply = await chat(prompt);

    return res.json({
      reply,
    });
  } catch (error) {
    console.error('Chat error:', error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Chat service is temporarily unavailable.',
    });
  }
});

// --------------------------------------------------
// MEDICINE SEARCH
// --------------------------------------------------

app.post('/api/medicine/search', async (req, res) => {
  try {
    const { query } = req.body ?? {};

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        error: 'query is required.',
      });
    }

    const result = await medicineSearch(query.trim());

    return res.json({
      result,
    });
  } catch (error) {
    console.error('Medicine search error:', error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Medicine search is temporarily unavailable.',
    });
  }
});

// --------------------------------------------------
// 404
// --------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({
    error: 'Route not found.',
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express error:', err);

  res.status(err?.status || 500).json({
    error: err?.message || 'Server error',
  });
});

app.listen(PORT, HOST, () => {
  console.log(
    `GetMedGo backend listening on http://${HOST}:${PORT}`
  );
});
