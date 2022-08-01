import {readFileSync} from 'node:fs';

function read_package_version(path) {
	return JSON.parse(readFileSync(new URL(`./node_modules/${path}/package.json`, import.meta.url))).version;
}

export const IMPLS = [];

// ********************************************************************************

import lib from '@ensdomains/eth-ens-namehash';
export const ensdomains = lib.normalize.bind(lib);
IMPLS.push({
	name: 'eth-ens-namehash', 
	fn: ensdomains, 
	version: read_package_version('@ensdomains/eth-ens-namehash')
});

// ********************************************************************************

import {ens_normalize as reference} from '@adraffy/ens-norm-ref-impl';
export {reference};
IMPLS.push({
	name: 'Reference', 
	fn: reference, 
	version: read_package_version(`@adraffy/ens-norm-ref-impl`)
});

// ********************************************************************************

import {ens_normalize} from '@adraffy/ens-normalize';
export {ens_normalize};
IMPLS.push({
	name: 'ens_normalize', 
	fn: ens_normalize, 
	version: read_package_version(`@adraffy/ens-normalize`)
});

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
IMPLS.push({
	name: 'UTS46',
	fn: uts46,
	version: UTS46_VERSION
});

export const ens0 = create_uts46({
	version: 2003,
	valid_deviations: true,
	check_hyphens: true,
	punycode: true,
});
IMPLS.push({
	name: 'ENS0',
	fn: ens0,
	version: UTS46_VERSION
});

export const strict2008 = create_uts46({
	version: 2008, 
	check_hyphens: true,
	check_bidi: true,
	contextJ: true,
	contextO: true,
	check_leading_cm: true,
	punycode: true,
});
IMPLS.push({
	name: 'Strict 2008',
	fn: strict2008,
	version: UTS46_VERSION
});

// ********************************************************************************

for (let impl of IMPLS) {
	impl.slug = impl.name.replace(/\s+/, '').toLowerCase();
}

// ********************************************************************************

// dump out if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
	let cols = ['#', 'name', 'slug', 'version'];
	let rows = IMPLS.map((impl, i) => cols.map(key => {
		if (key == '#') return String(i+1);
		return impl[key];
	}));
	let maxs = cols.map((_, i) => rows.reduce((a, row) => Math.max(a, row[i].length), cols[i].length));
	function format(v, pad = ' ', sep = ' | ') {
		return cols.map((_, i) => String(v[i]).padEnd(maxs[i], pad)).join(sep);
	}
	console.log(format(cols));
	console.log(format(cols.map(() => ''), '-', '-|-')); 
	for (let row of rows) {
		console.log(format(row));
	}
}