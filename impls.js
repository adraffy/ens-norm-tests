import {readFile} from 'node:fs/promises';

async function read_package_version(path) {
    return JSON.parse(await readFile(new URL(`./node_modules/${path}/package.json`, import.meta.url))).version;
}

export const IMPLS = [];

// ********************************************************************************

import lib from '@ensdomains/eth-ens-namehash';
export const ensdomains = lib.normalize.bind(lib);
IMPLS.push({
    name: 'eth-ens-namehash', 
    fn: ensdomains, 
    version: await read_package_version('@ensdomains/eth-ens-namehash')
});

// ********************************************************************************

import {ens_normalize as reference} from '@adraffy/ens-norm-ref-impl.js';
export {reference};
IMPLS.push({
    name: 'Reference', 
    fn: reference, 
    version: await read_package_version(`@adraffy/ens-norm-ref-impl.js`)
});

// ********************************************************************************

import {create_uts46} from '@adraffy/ens-norm-uts46.js';
const UTS46_VERSION = await read_package_version(`@adraffy/ens-norm-uts46.js`);
export const uts46 = await create_uts46({
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

export const ens0 = await create_uts46({
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

export const strict2008 = await create_uts46({
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