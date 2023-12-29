# ENSIP-15 Implementation Tests

[ENS Name Normalization Standard](https://docs.ens.domains/ens-improvement-proposals/ensip-15-normalization-standard)

## Implementations

* Javascript
	* [adraffy/ens-normalize.js](https://github.com/adraffy/ens-normalize.js)
	* [adraffy/ens-norm-uts46.js](https://github.com/adraffy/ens-norm-uts46.js)
		* UTS-46 According to Spec
		* UTS-46 w/IDNA 2008
		* ENS0 (ENSIP-1)
	* [ensdomains/eth-ens-namehash](https://github.com/ensdomains/eth-ens-namehash)
	* [ethers-io/ethers](https://github.com/ethers-io/ethers.js)
* C# — [adraffy/ENSNormalize.cs](https://github.com/adraffy/ENSNormalize.cs)
* Java — [adraffy/ENSNormalize.java](https://github.com/adraffy/ENSNormalize.cs)
	
## Build

1. `git clone --recurse-submodules` this repo
1. `npm install`

### Update to Latest

* `git submodule foreach git pull`

## Commands

* `npm run impls` — print function lineup
* `npm run count` — count known labels
* `npm run idempotence` — check if `f(f(x)) == f(x)`
* `npm run uts46` — determine where `f(uts46(x)) != f(x)` &rarr; [json](./test-misc/output/uts46.json)
* `npm run quick` — check validation status 
* `npm run validate` — generate HTML reports for validation tests &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-validation/output/)
* `npm run compare` — generate pair-wise HTML reports for registered labels &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-compare/output/)
* `npm run breakdown` — generate HTML reports for normalization error types &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-breakdown/output-20230226/)
* `npm run langs` — check that JS, CS, and Java implementations match on all known labels
