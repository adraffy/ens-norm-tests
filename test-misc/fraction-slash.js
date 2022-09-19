// count fraction slash

import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {mkdirSync, writeFileSync} from 'node:fs';

let labels = [];
for (let label of LABELS) {
	try {
		let norm = ens_normalize(label);
		if (norm.includes('⁄')) {
			labels.push(label);
		}
	} catch (err) {
	}
}

console.log(labels.length);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./fraction-slash.json', out_dir), JSON.stringify(labels, null, '\t'));
