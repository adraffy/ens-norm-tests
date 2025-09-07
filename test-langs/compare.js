import {readFileSync} from 'node:fs';
import {read_labels} from '../utils.js';
import {explode_cp} from '../../ens-normalize.js/src/utils.js';

// instructions:
//   1. npm run gitpull
//   2. compile and run each Tester
//   3. node compare.js

function read(lang) {
	let results = JSON.parse(readFileSync(new URL(`./output/${lang}.json`, import.meta.url)));
	return {lang, results};
}

const LABELS = read_labels();
const LANGS = ['java', 'js', 'cs', 'go', 'swift'].map(read);

console.log(new Date());

for (let {lang, results} of LANGS) {
	console.log(lang, results.length);
}

if (!LANGS.every(x => x.results.length === LABELS.length)) {
	throw new Error('mismatch results');
}

for (let i = 0; i < LABELS.length; i++) {	
	let label = LABELS[i];
	let results = LANGS.map(x => x.results[i]);
	try {
		let keys = results.map(x => Object.keys(x).toString());
		if (new Set(keys).size !== 1) {
			throw new Error('diff norm');
		}
		if (results.norm && new Set(results.map(x => x.norm).size !== 1)) {
			throw new Error('wrong norm');
		}
	} catch (err) {
		console.log({
			label,
			cps: explode_cp(label),
			i
		});
		console.log(results);
		throw err;
	}
}
console.log('SAME');

// 2024-09-14T20:57:38.802Z
// java 2944008
// js 2944008
// cs 2944008
// go 2944008
// SAME

// 2025-09-07T17:21:35.862Z
// js 3356216
// swift 3356216
// SAME
