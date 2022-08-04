// find f(x) = f(y)

import LABELS from '../eth-labels/db.js';
import {reference} from '../impls.js';
import {escape_unicode} from '../utils.js';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let tally = {};
for (let label of LABELS) {
	try {
		let norm = reference(label);
		let v = tally[norm];
		if (!v) tally[norm] = v = [];
		v.push(label);
	} catch (err) {
	}
}

const AN = /^[\u{6F0}-\u{6F9}\u{660}-\u{669}]+$/u;

tally = Object.entries(tally).filter(x => x[1].length > 1);

let trivial = [];
let pure_an = [];
let non_trivial = [];
for (let [norm, v] of tally) {
	if (new Set(v.map(x => x.toLowerCase())).size == 1) {
		trivial.push(v);
	} else if (v.every(x => AN.test(x))) {
		pure_an.push([norm, v.map(escape_unicode)]);
	} else {
		non_trivial.push([norm, v.map(escape_unicode)]);
	}
}

console.log({
	count: tally.length,
	trivial: trivial.length,
	pure_an: pure_an.length,
	non_trivial: non_trivial.length
});


writeFileSync(new URL('./collisions.json', out_dir), JSON.stringify({trivial, pure_an, non_trivial}, null, '\t'));