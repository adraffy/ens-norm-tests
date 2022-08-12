// check label fails qc

import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {explode_cp, parse_cp_range, escape_unicode} from '@adraffy/ens-norm-uts46';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const QC = new Set(JSON.parse(readFileSync(new URL('../unicode-json/DerivedNormalizationProps.json', import.meta.url))).NFC_QC.flatMap(([range, ty]) => {
	return ty == 'M' || ty == 'N' ? parse_cp_range(range) : [];
}));
const CC = Object.fromEntries(Object.entries(JSON.parse(readFileSync(new URL('../unicode-json/DerivedCombiningClass.json', import.meta.url)))).flatMap(([cls, v]) => {
	cls = parseInt(cls);
	return cls ? v.flatMap(s => parse_cp_range(s)).map(cp => [cp, cls]) : [];
}));

let fail_qc = LABELS.filter(s => fails_qc(s));

let pass_norm = fail_qc.filter(s => {
	try {
		ens_normalize(s);
		return true;
	} catch (err) {
	}
});

console.log({
	fail_qc: fail_qc.length,
	pass_norm: pass_norm.length
});

writeFileSync(new URL('./fails-qc.json', out_dir), JSON.stringify({
	fail_qc: fail_qc.map(escape_unicode),
	pass_norm: pass_norm.map(escape_unicode)
}, null, '\t'));

function fails_qc(s) {
	let cls0 = 0;
	for (let cp of explode_cp(s)) {
		if (QC.has(cp)) return true;
		let cls = CC[cp] ?? 0;
		if (cls0 > cls && cls > 0) return true;
		cls0 = cls;
	}
}