import {writeFileSync} from 'node:fs';
import {read_labels} from '../../ens-labels/labels.js';
import {ens_normalize} from '../../ens-normalize.js/src/lib.js';
import eth_ens_namehash from '../../ens-normalize.js/test/eth-ens-namehash@2.0.15.min.js';
import {is_invis_spoof} from '../spoof-utils.js';

let found = 0;
let spoof_invis = [];

let labels = read_labels();

for (let label of labels) {
	if ([...label].length < 3) continue; // too short
	try {
		if (label !== eth_ens_namehash.normalize(label)) continue; // not norm0
	} catch (err) {
		continue; // failed norm0
	}
	let norm;
	try {
		norm = ens_normalize(label);
		if (norm === label) continue; // same
	} catch (err) {
	}
	found++;
	if (is_invis_spoof(label)) {
		spoof_invis.push(label);
	}
}

console.log({
	count: labels.length,
	found,
	invis: spoof_invis.length,
});

writeFileSync(new URL('./output.json', import.meta.url), JSON.stringify({
	count: labels.length,
	found,
	spoof_invis
}, null, '\t'));
