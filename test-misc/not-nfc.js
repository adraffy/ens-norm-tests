// check label isn't nfc

import LABELS from '../eth-labels/db.js';

import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let found = LABELS.filter(s => s !== s.normalize('NFC'));

console.log({found: found.length});

writeFileSync(new URL('./not-nfc.json', out_dir), JSON.stringify(found, null, '\t'));