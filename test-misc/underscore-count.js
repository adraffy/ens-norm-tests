// count underscores

import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {explode_cp} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const UNDERSCORE = 0x5F;

let leading = {};
let includes = [];

for (let label of LABELS) {
	let norm;
	try {
		norm = ens_normalize(label);
	} catch (err) {
		continue;
	}	
	let cps = explode_cp(label);
	if (cps[0] === UNDERSCORE) {
		let n = 1;
		while (n < cps.length && cps[n] == UNDERSCORE) n++;
		add_bucket(leading, String(n), norm);
	} else if (cps.includes(UNDERSCORE)) {
		includes.push(norm);
	}
}

console.log({leading, includes: includes.length});

writeFileSync(new URL('./underscore-count.json', out_dir), JSON.stringify({leading, includes}, null, '\t'));

function add_bucket(tally, key, s) {
	let v = tally[key];
	if (!v) tally[key] = v = [];
	v.push(s);
}