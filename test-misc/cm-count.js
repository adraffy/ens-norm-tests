// count combining marks in names

import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {explode_cp, parse_cp_range} from '@adraffy/ens-norm-uts46';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const CM = new Set(Object.entries(JSON.parse(readFileSync(new URL('../unicode-json/DerivedGeneralCategory.json', import.meta.url))))
	.flatMap(([k, v]) => k.startsWith('M') ? v.flatMap(parse_cp_range) : []));

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let tally = {};
for (let label of LABELS) {
	try {
		let norm = ens_normalize(label);
		let cps = explode_cp(norm.normalize('NFD'));
		for (let i = 0; i < cps.length; ) {
			if (CM.has(cps[i++])) {
				let n = 1;
				while (i < cps.length && CM.has(cps[i])) {
					i++;
					n++;
				}
				tally[n] = (tally[n] ?? 0) + 1;
			}
		}
	} catch (err) {
	}
}

console.log(tally);

writeFileSync(new URL('./cm-count.json', out_dir), JSON.stringify(tally, null, '\t'));