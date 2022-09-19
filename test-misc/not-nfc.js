// check label isn't nfc

import LABELS from '../eth-labels/db.js';
import {mkdirSync, writeFileSync} from 'node:fs';
import {compare_arrays, explode_cp} from '../utils.js';
import {nfc} from '@adraffy/ens-normalize';

let found = LABELS.filter(s => {
	let cps = explode_cp(s);
	return compare_arrays(cps, nfc(cps));
});

console.log(found.length);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./not-nfc.json', out_dir), JSON.stringify(found, null, '\t'));
