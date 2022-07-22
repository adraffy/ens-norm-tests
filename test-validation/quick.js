import {IMPLS} from '../impls.js';
import {run_tests} from '@adraffy/ensip-norm';

for (let {name, fn} of IMPLS) {
    console.log(name, run_tests(fn).length);
}