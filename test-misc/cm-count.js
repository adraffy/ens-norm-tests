// count combining marks in names

import LABELS from '../eth-labels/db.js';
//import {CHARS} from '@adraffy/ensip-norm';
//import {ens_normalize_fragment} from '@adraffy/ens-normalize';
import {explode_cp, parse_cp_range} from '@adraffy/ens-norm-uts46';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const CM = new Set(Object.entries(JSON.parse(readFileSync(new URL('../unicode-json/DerivedGeneralCategory.json', import.meta.url))))
	.flatMap(([k, v]) => k.startsWith('M') ? v.flatMap(parse_cp_range) : []));

//const CM_VALID = new Set(CHARS.cm);
	
let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let tally = {};
let cases = [];
let start = [];
for (let label of LABELS) {
	try {
		let cps = explode_cp(label.normalize('NFD'));
		for (let i = 0; i < cps.length; ) {
			if (CM.has(cps[i++])) {
				let n = 1;
				while (i < cps.length && CM.has(cps[i])) {
					i++;
					n++;
				}
				tally[n] = (tally[n] ?? 0) + 1;
				if (n >= 2) {
					cases.push(label);
				}
			}
		}
		if (CM.has(cps[0])) {
			start.push(label);
		}
	} catch (err) {
	}
}

console.log({tally, cases: cases.length, start: start.length});

writeFileSync(new URL('./cm-count.json', out_dir), JSON.stringify({tally, cases, start}, null, '\t'));