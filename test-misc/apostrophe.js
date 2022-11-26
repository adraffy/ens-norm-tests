import LABELS from '../ens-labels/labels.js';
import {import_ens_normalize} from '../impls.js';
import { explode_cp } from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';

const {ens_normalize} = await import_ens_normalize();

const APOSTROPHE = 0x2019;

let count = 0;
let non_suffix = [];
let suffix = new Map();

for (let label of LABELS) {
	try {
		let norm = ens_normalize(label);
		if (norm === label) {
			let cps = explode_cp(label);
			let i = cps.indexOf(APOSTROPHE);
			if (i >= 0) {
				count++;
				if (i < cps.length - 2) {
					non_suffix.push(label);
				} else {
					let cp = cps[cps.length - 1];
					let rec = suffix.get(cp);
					if (!rec) {
						rec = {cp, form: String.fromCodePoint(cp), count: 0};
						suffix.set(cp, rec);
					}
					rec.count++;
				}
			}
		}
	} catch (err) {
	}	
}
suffix = [...suffix.values()].filter(x => x.count > 1).sort((a, b) => b.count - a.count);

console.log({
	count, 
	non_suffix: non_suffix.length, 
	suffix
});

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./apostrophe.json', out_dir), JSON.stringify({
	count,	
	suffix,
	non_suffix
}, null, '\t'));
