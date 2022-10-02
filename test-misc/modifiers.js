import LABELS from '../eth-labels/db.js';
import {UNICODE} from '../ens-normalize.js/derive/unicode-version.js';
import {ens_tokenize} from '../ens-normalize.js/src/lib.js';
import {explode_cp} from '../ens-normalize.js/src/utils.js';
import {mkdirSync, writeFileSync} from 'node:fs';

let pure = [];
let any = [];
let invalid = [];

let modifiers = new Set([
	UNICODE.emoji_skin_colors().map(x => x.cp),
	UNICODE.emoji_hair_colors().map(x => x.cp)
].flat());

for (let label of LABELS) {
	let cps = explode_cp(label);
	if (!cps.some(cp => modifiers.has(cp))) continue;
	any.push(label);
	if (cps.every(cp => modifiers.has(cp))) {
		pure.push(label);
	}
	for (let token of ens_tokenize(label)) {
		if (token.type === 'emoji' && modifiers.has(token.emoji[0])) {
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
writeFileSync(new URL('./modifiers.json', out_dir), JSON.stringify({any, pure, invalid}, null, '\t'));
