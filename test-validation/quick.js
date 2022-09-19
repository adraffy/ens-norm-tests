import {IMPLS} from '../impls.js';
import {run_validation_tests} from '../utils.js';

for (let {name, version, fn} of IMPLS) {
	console.log(`${name} (${version})`, run_validation_tests(fn).length);
}