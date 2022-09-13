import LABELS from '../eth-labels/db.js';
import {ens_normalize} from '@adraffy/ens-normalize';
import {explode_cp} from '@adraffy/ens-norm-uts46';
import {mkdirSync, writeFileSync} from 'node:fs';
import {hex_cp} from '../utils.js';
import {createHash} from 'node:crypto';

// [4aa0fbe1]
// apl stuff
// https://discuss.ens.domains/t/ens-name-normalization/8652/392
//let chars = explode_cp('⍡⍢⍣⍤⍥⍨⍩⍪⍮⍘⍙⍚⍛⍜⌿⍀⍳⍸⍴⍷⍵⍹⍺⍶⎀⎁⎂⎃⎜⎟⎢⎥⎨⎪⎬⎮⎸⎹⍿⏜⏝⏞⏟⏠⏡');

// [29ab077d]
// general punctuation
// https://discuss.ens.domains/t/ens-name-normalization/8652/396
let chars = [0x2033,0x2034,0x2036,0x2037,0x2057,0x2016,0x2018,0x2019,0x201A,0x201B,0x201C,0x201D,0x201E,0x201F,0x2020,0x2021,0x2022,0x2023,0x2027,0x2030,0x2031,0x2032,0x2035,0x2038,0x2039,0x203A,0x203D,0x203F,0x2040,0x2041,0x2043,0x2045,0x2046,0x204A,0x204B,0x204C,0x204D,0x204E,0x204F,0x2050,0x2051,0x2052,0x2053,0x2054,0x2055,0x2056,0x2058,0x2059,0x205A,0x205B,0x205D,0x205E];

chars = [...new Set(chars)];
console.log(chars);
console.log(chars.length);

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

let buckets = chars.map(() => []);
for (let label of LABELS) {
	let cps = explode_cp(label);
	for (let i = 0; i < chars.length; i++) {
		if (cps.includes(chars[i])) {
			buckets[i].push(label);
		}
	}
}

let tally = Object.fromEntries(chars.map((cp, i) => [`${hex_cp(cp)} ${String.fromCodePoint(cp)}`, buckets[i].length]))
let valid = [...new Set(buckets.flat())].filter(s => {
	try {
		ens_normalize(s);
		return true;
	} catch (err) {		
	}
});

console.log(tally);
console.log({
	total: buckets.reduce((a, x) => a + x.length, 0),
	valid: valid.length
});

let hash = createHash('sha256').update(String.fromCodePoint(...chars)).digest().toString('hex').slice(2, 10);
writeFileSync(new URL(`./frequency-${hash}.json`, out_dir), JSON.stringify({tally, valid}, null, '\t'));
console.log(`Hash: ${hash}`);
