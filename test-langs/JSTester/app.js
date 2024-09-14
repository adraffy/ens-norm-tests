import {read_labels} from '../../utils.js';
import {import_ens_normalize} from '../../impls.js';
import {writeFileSync} from 'node:fs';

const {ens_normalize} = await import_ens_normalize('dev');

writeFileSync(new URL('../output/js.json', import.meta.url), JSON.stringify(read_labels().map(name => {
	try {
		let norm = ens_normalize(name);
		if (norm === name) norm = undefined;
		return {norm};
	} catch (err) {
		return {error: err.message};
	}
})));