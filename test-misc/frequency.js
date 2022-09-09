import LABELS from '../eth-labels/db.js';
//import {ens_normalize_fragment} from '@adraffy/ens-normalize';
import {explode_cp} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';
import {hex_cp} from '../utils.js';

let chars = [...new Set(explode_cp('⍡⍢⍣⍤⍥⍨⍩⍪⍮⍘⍙⍚⍛⍜⌿⍀⍳⍸⍴⍷⍵⍹⍺⍶⎀⎁⎂⎃⎜⎟⎢⎥⎨⎪⎬⎮⎸⎹⍿⏜⏝⏞⏟⏠⏡'))];

console.log(chars);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let counts = chars.map(() => 0);
for (let label of LABELS) {
	let cps = explode_cp(label);
	for (let i = 0; i < chars.length; i++) {
		if (cps.includes(chars[i])) {
			counts[i]++;
		}
	}
}

let tally = Object.fromEntries(chars.map((cp, i) => [`${hex_cp(cp)} ${String.fromCodePoint(cp)}`, counts[i]]))

console.log(tally);
console.log(counts.reduce((a, x) => a + x, 0));

writeFileSync(new URL('./frequency.json', out_dir), JSON.stringify(tally, null, '\t'));