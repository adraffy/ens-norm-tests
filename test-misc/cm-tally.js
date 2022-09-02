// count combining marks

import LABELS from '../eth-labels/db.js';
import {explode_cp} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';
import {CM} from '../unicode-json/cm.js';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let tally = {};
for (let label of LABELS) {
	try {
		for (let cp of new Set(explode_cp(label.normalize('NFD')))) {
			if (CM.has(cp)) {
				tally[cp] = (tally[cp] ?? 0) + 1;
			}
		}
	} catch (err) {
	}
}

// convert to hex
tally = Object.fromEntries(Object.entries(tally).map(([k, v]) => [parseInt(k).toString(16).toUpperCase(), v]));

console.log(tally);

writeFileSync(new URL('./cm-tally.json', out_dir), JSON.stringify(tally, null, '\t'));