
import {readFileSync} from 'node:fs';

import {UnicodeSpec} from './ens-normalize.js/derive/unicode-logic.js';
export const SPEC = new UnicodeSpec(new URL('./ens-normalize.js/derive/data/15.0.0/', import.meta.url));

export * from './ens-normalize.js/src/utils.js';

// inject tests
import {run_tests} from './utils.js';
export function run_validation_tests(fn, tests) {
	if (!tests) {
		//tests= JSON.parse(readFileSync(new URL('./ens-normalize.js/validate/tests.json', import.meta.url)));
		tests = JSON.parse(readFileSync(new URL('./validation-tests/1.6.4.json', import.meta.url)));
	}
	return run_tests(fn, tests);
}

export function split_on(v, x) {
	let ret = [];
	let pos = 0;
	while (true) {
		let next = v.indexOf(x, pos);
		if (next == -1) break;
		ret.push(v.slice(pos, next));
		pos = next + 1;		
	}
	ret.push(v.slice(pos));
	return ret;
}
