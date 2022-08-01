import {TESTS} from '@adraffy/ensip-norm';

export function run_tests(fn) {
	let errors = [];
	for (let test of TESTS) {
		let {name, norm, error} = test;
		if (typeof norm !== 'string') norm = name;
		try {
			let result = fn(name);
			if (error) {	
				errors.push({fail: 'expected error', result, ...test});
			} else if (result != norm) {
				errors.push({fail: 'wrong norm', result, ...test});
			}
		} catch (err) {
			if (!error) {
				errors.push({fail: 'unexpected error', result: err.message, ...test});
			}
		}
	}
	return errors;
}