import { Router } from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const PROMPT = `Look at this image and extract any affirmation or motivational text from it.

Return a JSON object with:
- "title": A short title (2-5 words) summarizing the theme of the affirmation. If the image has an obvious title/heading, use that.
- "body": The full affirmation text. If there are multiple statements, format each as a markdown bullet point (- prefix). Clean up any OCR artifacts.

If the image does not contain affirmation or motivational text, return:
{ "title": "", "body": "", "error": "This image doesn't appear to contain an affirmation." }

Return ONLY the JSON object, no other text or markdown fencing.`;

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const client = new Anthropic({ apiKey });
  const base64 = req.file.buffer.toString('base64');
  const mediaType = req.file.mimetype as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('Extract affirmation error:', err);
    res.status(500).json({ error: 'Failed to extract affirmation from image' });
  }
});

export default router;
