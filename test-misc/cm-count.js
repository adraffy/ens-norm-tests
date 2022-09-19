// count runs of combining marks

import LABELS from '../eth-labels/db.js';
import {SPEC, explode_cp} from '../utils.js';
import {nfd} from '@adraffy/ens-normalize';
import {mkdirSync, writeFileSync} from 'node:fs';

const CM = new Set(SPEC.general_category('M').map(x => x.cp));

let tally = {};
let cases = [];
let start = [];
for (let label of LABELS) {
	try {
		let cps = nfd(explode_cp(label));
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

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./cm-count.json', out_dir), JSON.stringify({tally, cases, start}, null, '\t'));
