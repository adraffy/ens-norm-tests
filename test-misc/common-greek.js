import LABELS from '../eth-labels/db.js';
import {UNICODE} from '../ens-normalize.js/derive/unicode-version.js';
import {explode_cp} from '../ens-normalize.js/src/utils.js';
import {mkdirSync, writeFileSync} from 'node:fs';

/*
import {ens_normalize} from '../ens-normalize.js/src/lib.js';

function is_norm(s) {
	try {
		ens_normalize(s);
		return true;
	} catch (err) {
	}
}
*/

let m = explode_cp('µμξɷπ').map(cp => [cp, []]);

for (let label of LABELS) {
	let cps = explode_cp(label);
	for (let [cp, v] of m) {
		if (cps.includes(cp)) {
			v.push(label);
		}
	}
}

console.log(m.map(([cp, v]) => [UNICODE.format(cp), v.length]));

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./common-greek.json', out_dir), JSON.stringify(Object.fromEntries(m.map(([cp, v]) => [UNICODE.format(cp), v])), null, '\t'));
