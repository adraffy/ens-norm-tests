// find where arabic digit names are impacted by mapping

import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
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
			let norm = ens_normalize(label);
			let v = tally[norm];
			if (!v) tally[norm] = v = [];
			v.push([mapped, escaped]);
			if (mapped) valid.push(escaped);
		} catch (err) {
			if (mapped) invalid.push(escaped);
		}
	}
}

let both = Object.entries(tally)
	.map(x => x[1]) // forget norm
	.filter(v => v.length > 1 && v.some(x => x[0])) // require one mapped
	.map(v => v.map(x => x[1])) // drop mapped bool
	.sort((a, b) => b.length - a.length); // sort by freq

console.log({
	valid: valid.length,
	invalid: invalid.length,
	both: both.length
});

writeFileSync(new URL('./arabic-numerals.json', out_dir), JSON.stringify({valid, invalid, both}, null, '\t'));