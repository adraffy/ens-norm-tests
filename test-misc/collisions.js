// find f(x) = f(y)

import LABELS from '../eth-labels/db.js';
import {reference} from '../impls.js';
import {escape_unicode} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let tally = {};
for (let label of LABELS) {
	try {
		let norm = reference(label);
		let v = tally[norm];
		if (!v) tally[norm] = v = [];
		v.push(escape_unicode(label));
	} catch (err) {
	}
}

tally = Object.fromEntries(Object.entries(tally).filter(x => x[1].length > 1));

console.log({count: Object.keys(tally).length});

writeFileSync(new URL('./collisions.json', out_dir), JSON.stringify(tally, null, '\t'));