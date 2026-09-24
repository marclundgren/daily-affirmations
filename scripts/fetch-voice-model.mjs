// Downloads the on-device speech model (Vosk small English, ~40 MB) into the client's
// public folder, where browsers download and cache it. It's too big to keep in git.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const URL = 'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz';
const SHA256 = 'f0b24bb92a48ca575b6a96500d6b543f0f079c573dfe85bbe16001fc0404e1d8';
const DEST = 'src/client/public/voice/vosk-model-small-en-us-0.15.tar.gz';

const sha256 = buf => createHash('sha256').update(buf).digest('hex');

const existing = await readFile(DEST).catch(() => null);
if (existing && sha256(existing) === SHA256) process.exit(0);

console.log('Downloading voice model…');
const res = await fetch(URL);
if (!res.ok) throw new Error(`Voice model download failed: ${res.status} ${res.statusText}`);
const data = Buffer.from(await res.arrayBuffer());
if (sha256(data) !== SHA256) throw new Error('Voice model checksum mismatch');
await mkdir(dirname(DEST), { recursive: true });
await writeFile(DEST, data);
