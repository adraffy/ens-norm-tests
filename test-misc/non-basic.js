// count non-basic

import LABELS from '../eth-labels/db.js';
import {reference} from '../impls.js';
import {mkdirSync, writeFileSync} from 'node:fs';
import { escape_unicode } from '@adraffy/ens-norm-uts46';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const BASIC = /^[a-z0-9.-]+$/;

let unique = new Set();
let non_basic = [];
for (let label of LABELS) {
	try {
		let norm = reference(label);
		if (unique.has(norm)) continue;
		unique.add(norm);	
		if (!BASIC.test(norm)) {
			non_basic.push(norm);
		}
	} catch (err) {
	}
}
console.log({count: unique.size, non_basic: non_basic.length});

non_basic = Object.fromEntries(non_basic.map(x => [x, escape_unicode(x)]));

writeFileSync(new URL('./non-basic.json', out_dir), JSON.stringify(non_basic, null, '\t'));