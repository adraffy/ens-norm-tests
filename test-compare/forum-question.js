import {require_impl} from '../impls.js';

let impl = require_impl('ENS0');
//let impl = require_impl('eth-ens-namehash');
//let impl = require_impl('ens-validation');

let v = [
	'℞drug.eth',
	'latin♛.eth',
	'mcdonald’s🍔️.eth',
	'mcdonald’s🍟️.eth',
];
for (let name of v) {
	let ret;
	try {
		ret = impl.fn(name) === name
	} catch (err) {
		ret = err.message;
	}
	console.log(name, ret);
}