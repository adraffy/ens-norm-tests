// check label fails qc

import LABELS from '../eth-labels/db.js';
import {ens_normalize_fragment} from '@adraffy/ens-normalize';
import {SPEC, explode_cp, escape_unicode} from '../utils.js';
import {mkdirSync, writeFileSync} from 'node:fs';

const QC = new Set(SPEC.nf_props().NFC_QC.map(x => x[0]));
const CC = new Map(SPEC.chars.filter(x => x.cc).map(x => [x.cp, x.cc]));

let fail_qc = LABELS.filter(s => fails_qc(s));
function fails_qc(s) {
	let cls0 = 0;
	for (let cp of explode_cp(s)) {
		if (QC.has(cp)) return true;
		let cls = CC.get(cp)|0;
		if (cls0 > cls && cls > 0) return true;
		cls0 = cls;
	}
}

let pass_norm = fail_qc.filter(s => {
	try {
		ens_normalize_fragment(s);
		return true;
	} catch (err) {
	}
});

console.log({
	fail_qc: fail_qc.length,
	pass_norm: pass_norm.length
});

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./fails-qc.json', out_dir), JSON.stringify({
	fail_qc: fail_qc.map(escape_unicode),
	pass_norm: pass_norm.map(escape_unicode)
}, null, '\t'));
