// check that every:
// * valid is norm
// * mapped input is not norm
// * mapped output is norm
// * ignored is empty string

import {CHARS} from '@adraffy/ensip-norm';
import {ens_normalize} from '@adraffy/ens-normalize';

for (let cp of CHARS.valid) {
	if (!is_normalized(String.fromCodePoint(cp))) throw new Error(`wtf valid ${cp}`);
}
for (let [cp, cps] of CHARS.mapped) {
	if (is_normalized(String.fromCodePoint(cp))) throw new Error(`wtf mapped input ${cp}`);
	if (!is_normalized(String.fromCodePoint(...cps))) throw new Error(`wtf mapped output ${cps}`); 
}
for (let cp of CHARS.ignored) {
	if (ens_normalize(String.fromCodePoint(cp)) !== '') throw new Error(`wtf ignored ${cp}`);
}
console.log('OK');

function is_normalized(s) {
	try {
		return ens_normalize(s) === s;
	} catch (err) {
	}
}