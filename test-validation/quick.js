import {IMPLS} from '../impls.js';
import {run_tests} from '@adraffy/ensip-norm';

for (let {name, version, fn} of IMPLS) {
    console.log(`${name} (${version})`, run_tests(fn).length);
}