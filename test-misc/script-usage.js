import {mkdirSync, writeFileSync} from 'node:fs';
import {ens_tokenize} from '../ens-normalize.js/src/lib.js';
import LABELS from '../eth-labels/db.js';
import {SCRIPTS} from '../ens-normalize.js/derive/unicode-version.js';

function strip_emoji(s) {
	return ens_tokenize(s).flatMap(t => {
		if (t.type === 'emoji') {
			return [];
		} else if (t.type === 'nfc') {
			return t.input;
		} else {
			return t.cp ?? t.cps;
		}
	});
}

let all = new Set();

for (let label of LABELS) {
	for (let cp of strip_emoji(label)) {
		all.add(cp);
	}
}

let map = Object.fromEntries(SCRIPTS.entries.map(x => [x.abbr, [...x.set].filter(cp => all.has(cp))]).filter(x => x[1].length > 0));

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./script-usage.json', out_dir), JSON.stringify(map));
