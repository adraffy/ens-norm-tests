import LABELS from '../eth-labels/db.js';
import {UNICODE} from '../ens-normalize.js/derive/unicode-version.js';
import {explode_cp} from '../ens-normalize.js/src/utils.js';
import {mkdirSync, writeFileSync} from 'node:fs';

let pure = [];
let any = [];
let invalid = [];

let regionals = new Set(UNICODE.regional_indicators());
let flag_trie = new Map();
for (let {cps: [a, b]} of UNICODE.valid_emoji_flag_sequences()) {
	let next = flag_trie.get(a);
	if (!next) {
		next = new Set();
		flag_trie.set(a, next);
	}
	next.add(b);
}

for (let label of LABELS) {
	let cps = explode_cp(label);
	if (!cps.some(cp => regionals.has(cp))) continue;
	any.push(label);
	if (cps.every(cp => regionals.has(cp))) {
		pure.push(label);
	}
	for (let i = 0; i < cps.length; i++) {
		if (!regionals.has(cps[i])) continue;
		let next = flag_trie.get(cps[i]);
		if (!next || !next.has(cps[++i])) {
			invalid.push(label);
			break;
		}
	}
}

console.log({
	any: any.length,
	pure: pure.length,
	invalid: invalid.length,
	valid: any.length - invalid.length
});

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./regionals.json', out_dir), JSON.stringify({any, pure, invalid}, null, '\t'));
