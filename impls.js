import {readFileSync} from 'node:fs';

function read_package_version(path) {
	return JSON.parse(readFileSync(new URL(`./node_modules/${path}/package.json`, import.meta.url))).version;
}

export const IMPLS = [];

// ********************************************************************************

import A from '@ensdomains/eth-ens-namehash';
IMPLS.push({
	name: 'eth-ens-namehash', 
	fn: A.normalize.bind(A), 
	version: read_package_version('@ensdomains/eth-ens-namehash')
});


import {ens_normalize as ethers} from '@ethersproject/hash/lib/ens-normalize/lib.js';
IMPLS.push({
	name: 'ethers', 
	fn: ethers, 
	version: read_package_version('ethers')
});

// ********************************************************************************

import {ens_normalize} from '@adraffy/ens-normalize';
IMPLS.push({
	name: 'ens_normalize', 
	fn: ens_normalize, 
	version: read_package_version(`@adraffy/ens-normalize`),
	primary: true
});

/*
import {ens_normalize} from './ens-normalize.js/src/lib.js';
IMPLS.push({
	name: 'ens_normalize', 
	fn: ens_normalize, 
	version: 'HEAD'
});
*/

import {ens_normalize as prior} from 'prior_ens_norm';
IMPLS.push({
	name: 'ens_normalize', 
	fn: prior, 
	version: read_package_version(`prior_ens_norm`),
	prior: true
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
	check_hyphens: false, // 20220918: i had these as true
	punycode: false,      // they probably should be false
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
	impl.slug = impl.name.replace(/\s+/, '').toLowerCase() + '_' + impl.version;
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