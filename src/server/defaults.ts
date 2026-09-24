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
];
