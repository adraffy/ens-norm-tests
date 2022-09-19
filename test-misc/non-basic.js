// count non-basic

import LABELS from '../eth-labels/db.js';
import {escape_unicode} from '../utils.js';
import {ens_normalize, ens_tokenize} from '@adraffy/ens-normalize';
import {mkdirSync, writeFileSync} from 'node:fs';

const BASIC = /^[a-z0-9-]+$/;

function is_basic(norm) {
	if (BASIC.test(norm)) return true;
	for (let token of ens_tokenize(norm)) {
		switch (token.type) {
			case 'valid': if (!BASIC.test(String.fromCodePoint(...token.cps))) return false;
			case 'stop':
			case 'emoji': continue;
			default: throw new Error('not normalized');
		}
	}
	return true;
}

let unique = new Set();
let non_basic = [];
for (let label of LABELS) {
	try {
		let norm = ens_normalize(label);
		if (unique.has(norm)) continue;
		unique.add(norm);	
		if (!is_basic(norm)) {
			non_basic.push(norm);
		}
	} catch (err) {
	}
}
console.log({count: unique.size, non_basic: non_basic.length});

non_basic = Object.fromEntries(non_basic.map(x => [x, escape_unicode(x)]));

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./non-basic.json', out_dir), JSON.stringify(non_basic, null, '\t'));
