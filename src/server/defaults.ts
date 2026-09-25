import type { AffirmationInput } from '../shared/types';

const daily = (title: string, body: string): AffirmationInput => ({ title, body, cadence: 'daily', days: [], archived: false });

/** Seeded into an empty database. */
export const DEFAULT_AFFIRMATIONS: AffirmationInput[] = [
  daily(
    'Invite Divine Guidance',
    `Every morning, say:

> I give my spirit guides permission to help me today in every area of my life.

Open yourself to guidance, synchronicities, and **unexpected opportunities.**`,
  ),
  daily(
    'Protect Your Energy',
    `Say:

> Clear my energy of all negativity. Surround me with protective light. Help me recognize what energy is mine and release what isn't.

Your energy **shapes your reality.**`,
  ),
  daily(
    'Remove Hidden Blocks',
    `Affirm:

> Remove every block and limiting belief that's holding me back from my highest timeline.

When inner resistance disappears, **manifestation flows naturally.**`,
  ),
  daily(
    'Reveal the Miracles',
    `Say:

> Show me the miracles already surrounding me and help me notice the beauty in every moment.

**What you focus on expands.**`,
  ),
  daily(
    'Guide Me to My Highest Path',
    `Affirm:

> Lead me to the path that fulfills my purpose and helps me reach my highest potential.

Trust the next step, even if you can't see **the whole journey.**`,
  ),
  daily(
    'Make Your Presence Known',
    `Say:

> Spirit guides aligned with my highest good, make your presence known to me. Show me a sign that you are with me. I welcome your presence, protection and guidance.`,
  ),
  daily(
    'Protect My Energy',
    `Say:

> Spirit guides, clear my energy of anything that doesn't belong to me. Surround me with light and ground me in my own energy.`,
  ),
  daily(
    'Show Me What Is Holding Me Back',
    `Affirm:

> Show me what is standing in my way, including what I cannot see for myself. Guide me to release the patterns and attachments that are keeping me stuck.`,
  ),
  daily(
    'Show Me What Is Opening for Me',
    `Say:

> Show me the support, opportunities and miracles already unfolding around me. Open my eyes to what I have been missing.`,
  ),
  daily(
    'Guide Me Toward My Highest Path',
    `Affirm:

> Guide me toward the people, places and choices aligned with my highest path. Make the next step clear and give me the courage to take it.`,
  ),
];
