// find where f(uts46(x)) != f(x)

import {reference} from '../impls.js';
import LABELS from '../eth-labels/db.js';
import {mkdirSync, writeFileSync} from 'node:fs';
import {escape_unicode} from '../utils.js';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const MAPPED = /[\u{6F0}-\u{6F3}\u{6F7}-\u{6F9}]/u;
const PROPER = /[\u{660}-\u{663}\u{667}-\u{669}]/u;

let valid = [];
let invalid = [];
let tally = {};
for (let label of LABELS) {
	let mapped = MAPPED.test(label);
	let proper = PROPER.test(label);
	if (mapped || proper) {
		let escaped = escape_unicode(label);
		try {
			let norm = reference(label);
			let v = tally[norm];
			if (!v) tally[norm] = v = [];
			v.push(escaped);
			if (mapped) valid.push(escaped);
		} catch (err) {
			if (mapped) invalid.push(escaped);
		}
	}
}

let both = Object.entries(tally).map(x => x[1]).filter(x => x.length > 1).sort((a, b) => b.length - a.length);

console.log({
	valid: valid.length,
	invalid: invalid.length,
	both: both.length
});

writeFileSync(new URL('./arabic-damage.json', out_dir), JSON.stringify({valid, invalid, both}, null, '\t'));