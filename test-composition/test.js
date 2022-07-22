// https://discuss.ens.domains/t/ens-name-normalization/8652/230

import {uts46, reference} from '../impls.js';
import LABELS from '../eth-labels/db.js';

for (let label of LABELS) {
	let a, b;
	try {
		a = uts46(label);
		b = reference(label);
	} catch (err) {
		continue;
	}
	if (reference(a) != b) {
		console.log(label);
	}
}