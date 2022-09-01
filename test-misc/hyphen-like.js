// count hyphen-likes in names

import LABELS from '../eth-labels/db.js';
import {ens_normalize_fragment} from '@adraffy/ens-normalize';
import {explode_cp} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';

const HYPHENS = [
	0x2D,
	0x2010,
	0x2011,
	0x2012,
	0x2013,
	0x2014,
	0x2015,
	0x207B,
	0x208B,
	0xFE31,
	0xFE32,
	0xFE58
].map(cp => [cp, `${String.fromCodePoint(cp)} {${cp.toString(16).toUpperCase()}}`]);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let count = 0;
let tally = Object.fromEntries(HYPHENS.map(x => [x[1], 0]));
let after = {};
for (let label of LABELS) {
	let any = false;
	let cps = explode_cp(label);
	for (let [cp, key] of HYPHENS) {
		if (cps.includes(cp)) {
			tally[key]++;
			any = true;
		}
	}
	if (any) count++;
	try {
		let cps = explode_cp(ens_normalize_fragment(label));
		for (let [cp, key] of HYPHENS) {
			if (cps.includes(cp)) {
				after[key] = (after[key] ?? 0) + 1;
			}
		}
	} catch (err) {	
	}
}

console.log({count, tally, after});

writeFileSync(new URL('./hyphen-like.json', out_dir), JSON.stringify({count, tally, after}, null, '\t'));