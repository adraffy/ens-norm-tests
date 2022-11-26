import {read_spec} from '../ens-normalize.js/validate/data.js';
import LABELS from '../ens-labels/labels.js';
import {import_ens_normalize} from '../impls.js';
import { explode_cp } from '@adraffy/ens-norm-uts46';
import { print_section } from '../ens-normalize.js/derive/utils.js';

const {ens_normalize} = await import_ens_normalize();

let fenced = read_spec().fenced.map(([cp, name]) => ({cp, name, count: 0, inner: []}));

for (let label of LABELS) {
	if (label.length < 5) continue;
	try {
		let norm = ens_normalize(label);
		if (norm === label) {
			let cps0 = explode_cp(norm)
			let cps_middle = cps0.slice(2, -2);
			for (let rec of fenced) {
				if (cps0.includes(rec.cp)) {
					rec.count++;
					if (cps_middle.includes(rec.cp)) {
						rec.inner.push(label);
					}
				}
			}
		}	
	} catch (err) {		
	}	
}

for (let {name, count, inner} of fenced) {
	print_section(`${name} (${inner.length}/${count})`);
	for (let label of inner) {
		console.log(label);
	}
}