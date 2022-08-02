// find where f(uts46(x)) != f(x)

import {reference} from '../impls.js';
import LABELS from '../eth-labels/db.js';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let regex = /[\u{6F0}-\u{6F3},\u{6F7}-\u{6F9}]/u;

let valid = [];
let invalid = [];
for (let label of LABELS) {
	if (regex.test(label)) {
		try {
			reference(label);
			valid.push(label);
		} catch (err) {
			invalid.push(label);
		}
	}
}

let total = valid.length + invalid.length;

console.log({
	total,
	valid: valid.length,
	invalid: invalid.length
});

writeFileSync(new URL('./arabic-damage.json', out_dir), JSON.stringify({total, valid, invalid}, null, '\t'));