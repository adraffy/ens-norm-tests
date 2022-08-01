// find where f(uts46(x)) != f(x)

import {uts46, reference} from '../impls.js';
import LABELS from '../eth-labels/db.js';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

// https://discuss.ens.domains/t/ens-name-normalization/8652/230
// ENSNORM(UTS46(name)) != ENSNORM(name)
// should only be "xn--*" as of 2022-08-01
let errors = test(reference);
writeFileSync(new URL('./uts46.json', out_dir), JSON.stringify(errors));
console.log(errors);

function test(fn) {
	let errors = [];
	for (let label of LABELS) {
		let a, b;
		try {
			a = uts46(label);
			b = fn(label);
		} catch (err) {
			continue;
		}
		if (reference(a) != b) {
			errors.push(label);
		}
	}
	return errors;
}