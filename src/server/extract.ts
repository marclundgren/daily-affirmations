import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

const Extraction = z.object({
  found: z.boolean().describe('False if the image contains no affirmation or motivational text.'),
  title: z.string(),
  body: z.string(),
});

const PROMPT = `This image contains an affirmation (often a screenshot from Pinterest or Instagram). Transcribe it into our format.

- title: the heading, in Title Case, without any leading number ("1. INVITE DIVINE GUIDANCE" → "Invite Divine Guidance"). If there is no heading, write a 2–5 word title.
- body: markdown using only these conventions:
  - The words the reader should say aloud go in a blockquote line ("> ...") without surrounding quotation marks.
  - Instructions like "Say:" or "Every morning, say:" are a plain paragraph before the quote.
  - Supporting text is a plain paragraph after it. Emphasized or highlighted phrases in that text become **bold**.
  - A list of separate affirmations becomes "- " bullet lines instead of a quote.
  - Separate blocks with a blank line.

Transcribe faithfully; fix only obvious OCR artifacts.`;

type ImageType = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
const IMAGE_TYPES: ImageType[] = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

export class ExtractError extends Error {}

export async function extractAffirmation(client: Anthropic, image: File): Promise<{ title: string; body: string }> {
  const mediaType = IMAGE_TYPES.find(t => t === image.type);
  if (!mediaType) throw new ExtractError('Use a PNG, JPEG, GIF or WebP image.');

  const data = Buffer.from(await image.arrayBuffer()).toString('base64');
  const response = await client.beta.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 4000,
    output_config: { effort: 'low', format: betaZodOutputFormat(Extraction) },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });

  const result = response.parsed_output;
  if (response.stop_reason === 'refusal' || !result) throw new ExtractError("Couldn't read that image.");
  if (!result.found) throw new ExtractError("That image doesn't seem to contain an affirmation.");
  return { title: result.title, body: result.body };
}
