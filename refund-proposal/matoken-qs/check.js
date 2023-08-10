import {writeFileSync} from 'node:fs';
import {read_csv} from '../../utils.js';
import {ens_normalize} from '../../ens-normalize.js/src/lib.js';
import eth_ens_namehash from '../../ens-normalize.js/test/eth-ens-namehash@2.0.15.min.js';
import {explode_cp, parse_cp_range} from '../../ens-normalize.js/derive/utils.js';
import {UNICODE} from '../../ens-normalize.js/derive/unicode-version.js';
import {read_spec} from '../../ens-normalize.js/validate/data.js';
import {is_invis_spoof, filter_emoji} from '../spoof-utils.js';

function is_ensip1(s) {
	try {
		return s === eth_ens_namehash.normalize(s);
	} catch (err) {
	}
}

function is_ensip15(s) {
	try {
		return s === ens_normalize(s);
	} catch (err) {		
	}
}

const LATN = UNICODE.require_script('Latn');
// const CYRL = UNICODE.require_script('Cyrl');
// const GREK = UNICODE.require_script('Grek');

const SPEC = read_spec();

const SMALL_CAPS = new Set(explode_cp('ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘꞯʀꜱᴛᴜᴠᴡxʏᴢ')); // x?
const ARABIC_AN = new Set([...parse_cp_range('6F0..6F9'), ...parse_cp_range('660..669')]);

let is_valid = new Set(SPEC.groups.flatMap(g => [...g.primary, ...g.secondary]));

let not_ensip1 = [];
let wrong_pure_emoji = [];
let small_caps = [];
let arabic_an = [];
let single_script = [];
let latin_like = [];
let all_invalid = [];
let braille_spacer = [];
let unknown = [];

const stores = {
	not_ensip1,
	wrong_pure_emoji,
	braille_spacer,
	small_caps,
	arabic_an,
	single_script,
	latin_like,
	all_invalid,
	unknown,
};

for (let {fulllabel} of read_csv(new URL('./20230809_refund_names.csv', import.meta.url))) {	
	if (!is_ensip1(fulllabel)) {
		not_ensip1.push(fulllabel);
		continue;
	}
	if (is_ensip15(fulllabel)) {
		throw new Error('normalized');
	}
	if (is_invis_spoof(fulllabel)) {
		throw new Error('invis spoof');
	}
	let text = filter_emoji(fulllabel);
	if (!text) {
		wrong_pure_emoji.push(fulllabel);
		continue;
	}
	let cps = explode_cp(text);
	if (cps.includes(0x2800)) {
		braille_spacer.push(fulllabel);
		continue;
	}
	let valid = cps.map(cp => is_valid.has(cp));
	let chars = [...new Set(cps.map(cp => UNICODE.require_char(cp)))];
	let scripts = [...new Set(chars.map(x => x.cp < 0x80 ? LATN : x.script))];

	if (scripts.length > 1 && scripts.every(x => x.abbr === 'Latn' || x.abbr === 'Grek' || x.abbr === 'Cyrl')) {
		latin_like.push(fulllabel);
		continue;
	}
 
	let wo_caps = cps.filter(x => !SMALL_CAPS.has(x));
	if (!wo_caps.length) {
		small_caps.push(fulllabel);
		continue;
	}

	let without_arabic_an = cps.filter(x => !ARABIC_AN.has(x));
	if (!without_arabic_an.length) {
		arabic_an.push(fulllabel);
		continue;
	}
	if (scripts.length === 1) {
		single_script.push(fulllabel);
		continue;
	}
	if (!valid.every(x => x)) {
		all_invalid.push(fulllabel);
		continue;
	}

	unknown.push(fulllabel);
	
	//console.log(valid.every(x => !x));
	//console.log({fulllabel, text, cps, scripts});
	//throw 1;
}

console.log(Object.fromEntries(Object.entries(stores).map(([k, v]) => [k, v.length])));

writeFileSync(new URL('./output.json', import.meta.url), JSON.stringify(stores, null, '\t'));