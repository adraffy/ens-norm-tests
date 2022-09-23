// count combining marks

import {mkdirSync, writeFileSync} from 'node:fs';
import LABELS from '../eth-labels/db.js';
import {SPEC, NF} from './ens-normalize.js/derive/unicode-version.js';
import {explode_cp} from './ens-normalize.js/src/utils.js';

const CM = new Set(SPEC.general_category('M').map(x => x.cp));

let tally = {};
for (let label of LABELS) {
	try {
		for (let cp of new Set(NF.nfd(explode_cp(label)))) {
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
