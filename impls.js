import {readFileSync} from 'node:fs';
import {print_table} from './ens-normalize.js/derive/utils.js';

function read_package_version(path) {
	if (typeof path === 'string') {
		path = new URL(`./node_modules/${path}/package.json`, import.meta.url);
	}
	return JSON.parse(readFileSync(path)).version;
}

export async function import_ens_normalize(version) {
	if (!version || version === 'latest') {
		return import('./ens-normalize.js/src/lib.js');
	} else if (version === 'dev') {
		return import('../ens-normalize.js/src/lib.js');
	} else {
		return import(`./old-versions/${version}.js`);
	}
}
export async function impl_for_version(version) {
	let lib = await import_ens_normalize(version);
	return new Impl('ens_normalize', lib.ens_normalize, version);
}

class Impl { 
	constructor(name, fn, version) {
		this.name = name;
		this.fn = fn;
		this.version = version;
	}
	get slug() {
		return this.name.replace(/\s+/, '').toLowerCase() + '_' + this.version;
	}
}

export const IMPLS = [];

export function require_impl(name) {
	let impl = IMPLS.find(x => x.name === name);
	if (!impl) throw new Error(`expected implementation: ${name}`);
	return impl;
}

// ********************************************************************************

import A from '@ensdomains/eth-ens-namehash';
IMPLS.push(new Impl('eth-ens-namehash', A.normalize.bind(A), read_package_version('@ensdomains/eth-ens-namehash')));

import {ens_normalize as ethers} from '@ethersproject/hash/lib/ens-normalize/lib.js';
IMPLS.push(new Impl('ethers', ethers, read_package_version('ethers')));

// ********************************************************************************

/*
import {ens_normalize} from '@adraffy/ens-normalize';
IMPLS.push({
	name: 'ens_normalize', 
	fn: ens_normalize, 
	version: read_package_version(`@adraffy/ens-normalize`),
	primary: true
});

import {ens_normalize as prior} from 'prior_ens_norm';
IMPLS.push({
	name: 'ens_normalize', 
	fn: prior, 
	version: read_package_version('prior_ens_norm'),
	prior: true
});
*/

// git branch instead
import {ens_normalize} from './ens-normalize.js/src/lib.js';
IMPLS.push(new Impl('ens_normalize.git', ens_normalize, JSON.parse(readFileSync(new URL('./ens-normalize.js/package.json', import.meta.url))).version));

// raffy's local branch
import {ens_normalize as ens_normalize_dev} from '../ens-normalize.js/src/lib.js';
IMPLS.push(new Impl('ens_normalize.local', ens_normalize_dev, JSON.parse(readFileSync(new URL('../ens-normalize.js/package.json', import.meta.url))).version));

// ********************************************************************************

import {create_uts46} from '@adraffy/ens-norm-uts46';
const UTS46_VERSION = read_package_version(`@adraffy/ens-norm-uts46`);
export const uts46 = create_uts46({
	version: 2003, 
	valid_deviations: true,
	check_hyphens: true,
	check_bidi: true,
	contextJ: true,
	check_leading_cm: true,
	punycode: true,
});
IMPLS.push(new Impl('UTS46', uts46, UTS46_VERSION));

export const ens0 = create_uts46({
	version: 2003,
	valid_deviations: true,
	check_hyphens: false, // 20220918: i had these as true
	punycode: false,      // they probably should be false
});
IMPLS.push(new Impl('ENS0', ens0, UTS46_VERSION));

export const strict2008 = create_uts46({
	version: 2008, 
	check_hyphens: true,
	check_bidi: true,
	contextJ: true,
	contextO: true,
	check_leading_cm: true,
	punycode: true,
});
IMPLS.push(new Impl('Strict 2008', strict2008, UTS46_VERSION));

// ********************************************************************************

// dump out if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
	print_table(
		['#', 'Name', 'Slug', {name: 'Version', align: 'R', min: 0}], 
		IMPLS.map((impl, i) => [i, impl.name, impl.slug, impl.version])
	);
}