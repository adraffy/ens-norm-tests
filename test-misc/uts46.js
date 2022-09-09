// find where f(uts46(x)) != f(x)

import LABELS from '../eth-labels/db.js';
import {uts46} from '../impls.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {mkdirSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

// https://discuss.ens.domains/t/ens-name-normalization/8652/230
// ENSNORM(UTS46(name)) != ENSNORM(name)
// 2022-08-01: should only be "xn--*"
// 2022-09-09: puny literals are no longer allowed, currently 0 results
let errors = test(ens_normalize);
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
		if (fn(a) != b) {
			errors.push(label);
		}
	}
	return errors;
}
