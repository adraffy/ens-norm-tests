import {ens_tokenize} from '../ens-normalize.js/src/lib.js';

// see: https://github.com/adraffy/ens-normalize.js/blob/main/derive/rules/emoji.js#L116
let non_rgi = [];
function escape_cp(cp) {
	return `\\u{${cp.toString(16)}}`;
}
// single regionals
for (let cp = 0x1F1E6; cp <= 0x1F1FF; cp++) non_rgi.push(escape_cp(cp));
// solo skin colors
for (let cp = 0x1F3FB; cp <= 0x1F3FF; cp++) non_rgi.push(escape_cp(cp));
// zwj sequences
for (let emoji of [
	// windows: https://blog.emojipedia.org/ninja-cat-the-windows-only-emoji/
	'🐱‍🐉','🐱‍💻','🐱‍🚀','🐱‍👤','🐱‍🏍','🐱‍👓',
	// man wrestler
	'🤼🏻‍♂','🤼🏼‍♂','🤼🏽‍♂','🤼🏾‍♂','🤼🏿‍♂', 
	// woman wrestler
	'🤼🏻‍♀','🤼🏼‍♀','🤼🏽‍♀','🤼🏾‍♀','🤼🏿‍♀', 
]) non_rgi.push(`${[...emoji].map(x => escape_cp(x.codePointAt(0))).join('')}\uFE0F?`);
export const NON_RGI_REGEX = new RegExp(`(${non_rgi.join('|')})`, 'ug');

// remove real emoji and non-rgi emoji with FE0F allowance
// keep everything else
export function filter_emoji(s) {
	return String.fromCodePoint(...ens_tokenize(s.replace(NON_RGI_REGEX, '')).flatMap(token => {
		switch (token.type) { 
			case 'emoji': return []; // ignore
			case 'nfc': return token.input; // pre-nfc
			case 'valid': return token.cps;
			default: return token.cp;
		}
	}));
}

export function is_invis_spoof(s) {
	return /(\uFE0F|\uFE0E|\u200C|\u200D)/u.test(filter_emoji(s));
}