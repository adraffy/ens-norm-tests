// find characters that are different in 2008
import {mkdirSync, writeFileSync} from 'node:fs';

import {PRINTER} from '../ens-normalize.js/derive/unicode-version.js';
import {ens_tokenize} from '../ens-normalize.js/src/lib.js';
import {compare_arrays} from '../ens-normalize.js/src/utils.js';

import {read_idna_rules} from '@adraffy/ens-norm-uts46';

let {valid, mapped} = read_idna_rules({use_STD3: true, version: 2008, valid_deviations: false});

let diffs = [];

for (let cp of valid) {
	let [t] = ens_tokenize(String.fromCodePoint(cp));
	switch (t.type) {
		case 'mapped': {
			console.log('[valid => mapped]', PRINTER.desc_for_mapped(cp, t.cps));
			diffs.push(cp);
			break;
		}
	}
}

for (let [x, ys] of mapped) {
	let [t] = ens_tokenize(String.fromCodePoint(x));
	switch (t.type) {
		case 'valid': {
			console.log('[mapped => valid]', PRINTER.desc_for_mapped(x, ys));
			diffs.push(x);
			break;
		}
		case 'mapped': {
			if (compare_arrays(ys, t.cps)) {
				console.log('[diff mapped]', PRINTER.desc_for_cp(x), PRINTER.desc_for_cps(ys), PRINTER.desc_for_cps(t.cps));
				diffs.push(x);
			}
			break;
		}
	}
}

console.log(diffs);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./2008.json', out_dir), JSON.stringify(diffs, null, '\t'));

// 20231228:
// [valid => mapped] 6F0 (۰) EXTENDED ARABIC-INDIC DIGIT ZERO => [660] (٠) ARABIC-INDIC DIGIT ZERO
// [valid => mapped] 6F1 (۱) EXTENDED ARABIC-INDIC DIGIT ONE => [661] (١) ARABIC-INDIC DIGIT ONE
// [valid => mapped] 6F2 (۲) EXTENDED ARABIC-INDIC DIGIT TWO => [662] (٢) ARABIC-INDIC DIGIT TWO
// [valid => mapped] 6F3 (۳) EXTENDED ARABIC-INDIC DIGIT THREE => [663] (٣) ARABIC-INDIC DIGIT THREE
// [valid => mapped] 6F7 (۷) EXTENDED ARABIC-INDIC DIGIT SEVEN => [667] (٧) ARABIC-INDIC DIGIT SEVEN
// [valid => mapped] 6F8 (۸) EXTENDED ARABIC-INDIC DIGIT EIGHT => [668] (٨) ARABIC-INDIC DIGIT EIGHT
// [valid => mapped] 6F9 (۹) EXTENDED ARABIC-INDIC DIGIT NINE => [669] (٩) ARABIC-INDIC DIGIT NINE
