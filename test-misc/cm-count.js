// count runs of combining marks

import {mkdirSync, writeFileSync} from 'node:fs';
import LABELS from '../eth-labels/db.js';
import {UNICODE, NF} from './ens-normalize.js/derive/unicode-version.js';
import {explode_cp} from './ens-normalize.js/src/utils.js';

const CM = new Set(UNICODE.general_category('M').map(x => x.cp));

let tally = {};
let cases = [];
let start = [];
for (let label of LABELS) {
	try {
		let cps = NF.nfd(explode_cp(label));
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
