import {ens_normalize as uts46} from '../../ens-normalize.js/dist/ens-normalize-UTS46.js';
import {ens_normalize as ref} from '../../ens-norm-ref-impl.js/ens-normalize.js';

import LABELS from '../eth-labels/db.js';

for (let label of LABELS) {
	let a, b;
	try {
		a = uts46(label);
		b = ref(label);
	} catch (err) {
		continue;
	}
	if (ref(a) != b) {
		console.log(label);
	}
}