// count non-basic

import LABELS from '../eth-labels/db.js';
import {escape_unicode} from '@adraffy/ens-norm-uts46';
import {ens_normalize, ens_tokenize} from '@adraffy/ens-normalize';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

/*
let emojiData = JSON.parse(readFileSync(new URL('../../ens-normalize.js-old/build/unicode-json/emoji-data.json', import.meta.url)));

function parse_range(s) {
	let pos = s.indexOf('..');
	if (pos >= 0) {
		let lo = parseInt(s.slice(0, pos), 16);
		let hi = parseInt(s.slice(pos + 2), 16);
		return Array(1 + hi - lo).fill().map((_, i) => lo + i);
	} else {
		return parseInt(s, 16);
	}
}

let picto = emojiData.Extended_Pictographic.flatMap(parse_range);
let pres = emojiData.Emoji_Presentation.flatMap(parse_range);
*/

//console.log(picto);
//throw 1;


const BASIC = /^[a-z0-9.-]+$/;
//const BASIC = /^_*[a-z0-9.-]+$/;
//const BASIC = /[_a-z0-9.-]+$/;

/*
// quick hack until ensip-norm includes text-presentation set
const BASIC_2 = new Set([
	...Array(128).fill().flatMap((_, i) => BASIC.test(String.fromCodePoint(i)) ? i : []),
	169, 174, 8596, 8597, 8598, 8599, 8600, 8601, 8617, 8618, 9000, 9167, 9197, 9198, 9199, 9201, 9202, 
	9208, 9209, 9210, 9642, 9643, 9654, 9664, 9723, 9724, 9728, 9729, 9730, 9731, 9732, 9742, 9745, 9752, 
	9757, 9760, 9762, 9763, 9766, 9770, 9774, 9775, 9784, 9785, 9786, 9792, 9794, 9823, 9824, 9827, 9829, 
	9830, 9832, 9851, 9854, 9874, 9876, 9877, 9878, 9879, 9881, 9883, 9884, 9888, 9895, 9904, 9905, 9928, 
	9935, 9937, 9939, 9961, 9968, 9969, 9972, 9975, 9976, 9977, 9986, 9992, 9993, 9996, 9997, 9999, 10002, 
	10004, 10006, 10013, 10017, 10035, 10036, 10052, 10055, 10083, 10084, 10145, 10548, 10549, 11013, 11014, 
	11015, 12336, 12349, 127344, 127345, 127358, 127359, 127777, 127780, 127781, 127782, 127783, 127784, 
	127785, 127786, 127787, 127788, 127798, 127869, 127894, 127895, 127897, 127898, 127899, 127902, 127903, 
	127947, 127948, 127949, 127950, 127956, 127957, 127958, 127959, 127960, 127961, 127962, 127963, 127964, 
	127965, 127966, 127967, 127987, 127989, 127991, 128063, 128065, 128253, 128329, 128330, 128367, 128368, 
	128371, 128372, 128373, 128374, 128375, 128376, 128377, 128391, 128394, 128395, 128396, 128397, 128400, 
	128421, 128424, 128433, 128434, 128444, 128450, 128451, 128452, 128465, 128466, 128467, 128476, 128477, 
	128478, 128481, 128483, 128488, 128495, 128499, 128506, 128715, 128717, 128718, 128719, 128736, 128737, 
	128738, 128739, 128740, 128741, 128745, 128752, 128755]);
*/

function is_basic(norm) {
	if (BASIC.test(norm)) return true;
	for (let token of ens_tokenize(norm)) {
		switch (token.type) {
			case 'valid': if (!BASIC.test(String.fromCodePoint(...token.cps))) return false;
			//case 'valid': if (!token.cps.every(cp => BASIC_2.has(cp))) return false;
			case 'stop':
			case 'emoji': continue;
			default: throw new Error('not normalized');
		}
	}
	return true;
}

let unique = new Set();
let non_basic = [];
for (let label of LABELS) {
	try {
		let norm = ens_normalize(label);
		if (unique.has(norm)) continue;
		unique.add(norm);	
		if (!is_basic(norm)) {
			non_basic.push(norm);
		}
	} catch (err) {
	}
}
console.log({count: unique.size, non_basic: non_basic.length});

non_basic = Object.fromEntries(non_basic.map(x => [x, escape_unicode(x)]));

writeFileSync(new URL('./non-basic.json', out_dir), JSON.stringify(non_basic, null, '\t'));