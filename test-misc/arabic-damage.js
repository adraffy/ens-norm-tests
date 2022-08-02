// find where f(uts46(x)) != f(x)

import {reference} from '../impls.js';
import LABELS from '../eth-labels/db.js';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const BEFORE = /[\u{6F0}-\u{6F3}\u{6F7}-\u{6F9}]/u;
const MAPPED = /[\u{660}-\u{663}\u{667}-\u{669}]/u;

let valid = [];
let invalid = [];
let tally = {};
for (let label of LABELS) {
	let before = BEFORE.test(label);
	let mapped = MAPPED.test(label);
	if (before || mapped) {
		try {
			let norm = reference(label);
			tally[norm] = (tally[norm] ?? 0) + 1;
			if (before) valid.push(label);
		} catch (err) {
			if (before) invalid.push(label);
		}
	}
}

let total = valid.length + invalid.length;
let both = Object.entries(tally).filter(x => x[1] > 1);

console.log({
	total,
	valid: valid.length,
	invalid: invalid.length,
	both: both.length
});

writeFileSync(new URL('./arabic-damage.json', out_dir), JSON.stringify({total, valid, invalid, both}, null, '\t'));