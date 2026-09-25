import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator as baseValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import type { Store } from './db';
import { extractAffirmation, ExtractError } from './extract';
import type { ServerConfig } from '../shared/types';

const id = z.coerce.number().int().positive();
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const profileInput = z.object({
  name: z.string().trim().min(1).max(40),
  emoji: z.string().min(1).max(16),
});

const affirmationInput = z
  .object({
    title: z.string().trim().min(1).max(120),
    body: z.string().trim().min(1).max(10_000),
    cadence: z.enum(['daily', 'weekly', 'monthly']),
    days: z.array(z.number().int().min(0).max(31)).max(31),
    archived: z.boolean(),
  })
  .transform(a => ({ ...a, days: a.cadence === 'daily' ? [] : [...new Set(a.days)].sort((x, y) => x - y) }));

/** zValidator that answers with a short, readable { error } instead of the raw Zod issue dump. */
const zValidator = <T extends z.ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  baseValidator(target, schema, (result, c) => {
    if (!result.success) {
      const message = result.error.issues.map(i => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message)).join('; ');
      return c.json({ error: message }, 400);
    }
  });

const notFound = () => {
  throw new HTTPException(404, { message: 'Not found' });
};

export function createApi(store: Store) {
  const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

  return new Hono()
    .get('/config', c => c.json<ServerConfig>({ imageImport: anthropic !== null }))

    .get('/profiles', c => c.json(store.listProfiles()))
    .post('/profiles', zValidator('json', profileInput), c => c.json(store.createProfile(c.req.valid('json')), 201))
    .put('/profiles/:id', zValidator('param', z.object({ id })), zValidator('json', profileInput), c =>
      c.json(store.updateProfile(c.req.valid('param').id, c.req.valid('json')) ?? notFound()),
    )
    .delete('/profiles/:id', zValidator('param', z.object({ id })), c =>
      store.deleteProfile(c.req.valid('param').id) ? c.body(null, 204) : notFound(),
    )

    .get('/profiles/:id/readings', zValidator('param', z.object({ id })), zValidator('query', z.object({ since: day })), c =>
      c.json(store.listReadings(c.req.valid('param').id, c.req.valid('query').since)),
    )
    .put(
      '/profiles/:id/readings/:day/:affirmationId',
      zValidator('param', z.object({ id, day, affirmationId: id })),
      zValidator('json', z.object({ read: z.boolean() })),
      c => {
        const p = c.req.valid('param');
        store.setReading(p.id, p.affirmationId, p.day, c.req.valid('json').read);
        return c.body(null, 204);
      },
    )

    .get('/affirmations', c => c.json(store.listAffirmations()))
    .post('/affirmations', zValidator('json', affirmationInput), c => c.json(store.createAffirmation(c.req.valid('json')), 201))
    .put('/affirmations/order', zValidator('json', z.object({ ids: z.array(id) })), c => {
      store.reorderAffirmations(c.req.valid('json').ids);
      return c.body(null, 204);
    })
    .put('/affirmations/:id', zValidator('param', z.object({ id })), zValidator('json', affirmationInput), c =>
      c.json(store.updateAffirmation(c.req.valid('param').id, c.req.valid('json')) ?? notFound()),
    )
    .delete('/affirmations/:id', zValidator('param', z.object({ id })), c =>
      store.deleteAffirmation(c.req.valid('param').id) ? c.body(null, 204) : notFound(),
    )

    .post('/import', async c => {
      if (!anthropic) throw new HTTPException(503, { message: 'Image import needs ANTHROPIC_API_KEY on the server.' });
      const image = (await c.req.parseBody()).image;
      if (!(image instanceof File)) throw new HTTPException(400, { message: 'No image provided.' });
      if (image.size > 8 * 1024 * 1024) throw new HTTPException(413, { message: 'Image is larger than 8 MB.' });
      try {
        return c.json(await extractAffirmation(anthropic, image));
      } catch (err) {
        if (err instanceof ExtractError) throw new HTTPException(422, { message: err.message });
        console.error('Image import failed:', err);
        throw new HTTPException(502, { message: 'Image import failed. Try again in a moment.' });
      }
    })

    .onError((err, c) => {
      if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
      console.error(err);
      return c.json({ error: 'Something went wrong.' }, 500);
    });
}
