// count combining marks

import LABELS from '../eth-labels/db.js';
import {SPEC, explode_cp} from '../utils.js';
import {nfd} from '@adraffy/ens-normalize';
import {mkdirSync, writeFileSync} from 'node:fs';

const CM = new Set(SPEC.general_category('M').map(x => x.cp));

let tally = {};
for (let label of LABELS) {
	try {
		for (let cp of new Set(nfd(explode_cp(label)))) {
			if (CM.has(cp)) {
				tally[cp] = (tally[cp] ?? 0) + 1;
			}
		}
	} catch (err) {
	}
}

// convert to hex
tally = Object.fromEntries(Object.entries(tally).map(([k, v]) => [SPEC.format(parseInt(k)), v]));

console.log(tally);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./cm-tally.json', out_dir), JSON.stringify(tally, null, '\t'));
