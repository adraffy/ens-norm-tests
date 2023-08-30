import {writeFileSync} from 'node:fs';
import {read_csv} from '../../utils.js';
import eth_ens_namehash from '../../ens-normalize.js/test/eth-ens-namehash@2.0.15.min.js';
import {ENS_NORMALIZE, is_invis_spoof, filter_emoji} from '../spoof-utils.js';

const {ens_normalize} = await import(new URL('./src/lib.js', ENS_NORMALIZE));
const {version, unicode, spec_hash} = await import(new URL('./src/include-versions.js', ENS_NORMALIZE));
const {explode_cp, parse_cp_range} = await import(new URL('./derive/utils.js', ENS_NORMALIZE));
const {UNICODE} = await import(new URL('./derive/unicode-version.js', ENS_NORMALIZE));
const {read_spec} = await import(new URL('./validate/data.js', ENS_NORMALIZE));

console.log({version, unicode, spec_hash});

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

const SPEC = read_spec();

const LATN = UNICODE.require_script('Latn');
// const CYRL = UNICODE.require_script('Cyrl');
// const GREK = UNICODE.require_script('Grek');

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