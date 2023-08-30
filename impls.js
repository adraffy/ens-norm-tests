import {readFileSync} from 'node:fs';
import {print_table} from './ens-normalize.js/derive/utils.js';

export const ENS_NORMALIZE_DEV = new URL('../ens-normalize.js/', import.meta.url); // local install, sibling of root
export const ENS_NORMALIZE_GIT = new URL('./ens-normalize.js/', import.meta.url); // installed via submodule

function read_package_version(path) {
	if (typeof path === 'string') {
		path = new URL(`./node_modules/${path}/package.json`, import.meta.url);
	}
	return JSON.parse(readFileSync(path)).version;
}

export async function import_ens_normalize(version) {
	if (!version || version === 'latest' || version === 'git') {
		return import(new URL('./src/lib.js', ENS_NORMALIZE_GIT));
	} else if (version === 'dev') {
		return import(new URL('./src/lib.js', ENS_NORMALIZE_DEV));
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
	toString() {
		return `${this.name} (${this.version})`;
	}
}

export const IMPLS = [];

export function require_impl(name) {
	let impl = IMPLS.find(x => x.name === name);
	if (!impl) throw new Error(`expected implementation: ${name}`);
	return impl;
}

// ********************************************************************************

import {ens_normalize as ethers} from '@ethersproject/hash/lib/ens-normalize/lib.js';
IMPLS.push(new Impl('ethers', ethers, read_package_version('ethers')));

import A from '@ensdomains/eth-ens-namehash';
IMPLS.push(new Impl('eth-ens-namehash', A.normalize.bind(A), read_package_version('@ensdomains/eth-ens-namehash')));

import B from '@ensdomains/ens-validation';
IMPLS.push(new Impl('ens-validation', name => {
	let norm = name.split('.').map(B.toUnicode).join('.');
	if (!B.validate(norm)) throw new Error('invalid');
	return norm;	
}, read_package_version('@ensdomains/ens-validation')));

/*
// frozen ENSIP-1 ESM build
const {normalize: normalize_2_0_15} = await import(new URL('./test/eth-ens-namehash@2.0.15.min.js', ENS_NORMALIZE_GIT));
IMPLS.push(new Impl('eth-ens-namehash', normalize_2_0_15, '2.0.15'));
*/

// ********************************************************************************

// git branch instead
const {ens_normalize: ens_normalize_git} = await import_ens_normalize('git');
IMPLS.push(new Impl('ens_normalize.git', ens_normalize_git, read_package_version(new URL('./package.json', ENS_NORMALIZE_GIT))));

// raffy's local branch
const {ens_normalize: ens_normalize_dev} = await import_ens_normalize('dev');
IMPLS.push(new Impl('ens_normalize.dev', ens_normalize_dev, read_package_version(new URL('./package.json', ENS_NORMALIZE_DEV))));

// ********************************************************************************

import {create_uts46} from '@adraffy/ens-norm-uts46';
const UTS46_VERSION = read_package_version(`@adraffy/ens-norm-uts46`);
export const uts46 = create_uts46({
	version: 2003, 
	use_STD3: true,
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
		['#', 'Name', 'Slug', 'Version'], 
		IMPLS.map((impl, i) => [i, impl.name, impl.slug, impl.version])
	);
}