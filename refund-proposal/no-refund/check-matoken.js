// double-check matoken

import {read_csv} from '../../utils.js';
import {is_invis_spoof} from '../spoof-utils.js';
import {ens_normalize} from '../../ens-normalize.js/src/lib.js';

let matoken = 0;
for (let {fulllabel} of read_csv(new URL('./20230404_refund_names.csv', import.meta.url))) {
	try {
		ens_normalize(fulllabel);		
		continue;
	} catch (err) {	
	}
	if (is_invis_spoof(fulllabel)) {
		matoken++;
	}
}
console.log({matoken});