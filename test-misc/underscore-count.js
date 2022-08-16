// count underscores

import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {explode_cp} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const UNDERSCORE = 0x5F;

let leading = {};
let anywhere = [];

for (let name of LABELS) {
	let norm;
	try {
		norm = ens_normalize(name);
	} catch (err) {
		continue;
	}
	for (let label of norm.split('.')) {
		let cps = explode_cp(label);
		if (cps[0] === UNDERSCORE) {
			let n = 1;
			while (n < cps.length && cps[n] == UNDERSCORE) n++;
			add_bucket(leading, String(n), norm);
		}
	}
	if (explode_cp(norm).includes(UNDERSCORE)) {
		anywhere.push(norm);
	}
}

console.log({leading, anywhere: anywhere.length});

writeFileSync(new URL('./underscore-count.json', out_dir), JSON.stringify({leading, anywhere}, null, '\t'));

function add_bucket(tally, key, s) {
	let v = tally[key];
	if (!v) tally[key] = v = [];
	v.push(s);
}