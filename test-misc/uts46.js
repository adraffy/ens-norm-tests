// find where f(uts46(x)) != f(x)

import {import_ens_normalize} from '../impls.js';
import {read_labels} from '../ens-labels/labels.js';
import {uts46} from '../impls.js';
import {mkdirSync, writeFileSync} from 'node:fs';

const {ens_normalize} = await import_ens_normalize('dev'); 
const LABELS = read_labels();

// https://discuss.ens.domains/t/ens-name-normalization/8652/230
// ENSNORM(UTS46(name)) != ENSNORM(name)
// 20220801: should only be "xn--*"
// 20220909: puny literals are no longer allowed, currently 0 results
// 20220918: still 0 results
// 20230226: still 0 results
let errors = test(ens_normalize);
console.log(errors);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./uts46.json', out_dir), JSON.stringify(errors));

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
