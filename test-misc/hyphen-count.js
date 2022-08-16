// count hyphens

import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {explode_cp} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const HYPHEN = 0x2D;

let raw = {};
let norm = {};

for (let name of LABELS) {
	try {
		count(norm, ens_normalize(name));
	} catch (err) {
	}
	count(raw, name);
}


writeFileSync(new URL('./hyphen-count.json', out_dir), JSON.stringify({raw, norm}, null, '\t'));

function count(tally, s) {
	for (let label of s.split('.')) {
		let cps = explode_cp(label);
		if (cps[2] === HYPHEN && cps[3] === HYPHEN) {
			add_bucket(tally, 'ext', s);
			break;
		}
	}
	let cps = explode_cp(s);
	let none = true;	
	for (let i = 0; i < cps.length; ) {
		if (cps[i++] == HYPHEN) {
			let n = 1;
			while (i < cps.length && cps[i] == HYPHEN) {
				i++;
				n++;
			}
			none = false;
			tally[n] = (tally[n] ?? 0) + 1;
			if (n >= 2) {
				add_bucket(tally, `names-${n}`, s);
			}
		}
	} 
	if (none) {
		tally[0] = (tally[0] ?? 0) + 1;
	}
}

function add_bucket(tally, key, s) {
	let v = tally[key];
	if (!v) tally[key] = v = [];
	v.push(s);
}