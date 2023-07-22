
import {readFileSync} from 'node:fs';

// inject tests
import {run_tests} from './ens-normalize.js/src/utils.js';
export function run_validation_tests(fn, tests) {
	if (!tests) {
		tests = JSON.parse(readFileSync(new URL('./ens-normalize.js/validate/tests.json', import.meta.url)));
		//tests = JSON.parse(readFileSync(new URL('./validation-tests/1.6.4.json', import.meta.url)));
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

export function html_escape(s) {
	return s.replaceAll(/[<>&]/gu, x => `&#${x.charCodeAt(0)};`);
}

export function datehash(date) {
	let y = date.getFullYear().toString().padStart(4, '0');
	let m = (1 + date.getMonth()).toString().padStart(2, '0');
	let d = date.getDate().toString().padStart(2, '0');
	return y+m+d;
}