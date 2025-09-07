# ENSIP-15 Implementation Tests

🏛️ [**ENSIP-15**: ENS Name Normalization Standard](https://docs.ens.domains/ensip/15)

## Javascript Implementations

* [adraffy/**ens-normalize.js**](https://github.com/adraffy/ens-normalize.js)
* [adraffy/**ens-norm-uts46.js**](https://github.com/adraffy/ens-norm-uts46.js)
	* UTS-46 According to Spec
	* UTS-46 w/IDNA 2008
	* ENS0 (ENSIP-1)
* [ensdomains/**eth-ens-namehash**](https://github.com/ensdomains/eth-ens-namehash)
* [ethers-io/**ethers**](https://github.com/ethers-io/ethers.js)

## Other Implementations

* [adraffy/**ENSNormalize.java**](https://github.com/adraffy/ENSNormalize.java)
* [adraffy/**ENSNormalize.cs**](https://github.com/adraffy/ENSNormalize.cs)
* [adraffy/**go-ens-normalize**](https://github.com/adraffy/go-ens-normalize)
* [adraffy/**ENSNormalize.swift**](https://github.com/adraffy/ENSNormalize.swift)

## Build

1. `git clone --recurse-submodules`
1. `npm install`

### Update to Latest

* `npm run gitpull`

## Commands

* `npm run impls` — print function lineup
* `npm run count` — count known labels
* `npm run idempotence` — check if `f(f(x)) == f(x)`
* `npm run uts46` — determine where `f(uts46(x)) != f(x)` &rarr; [json](./test-misc/output/uts46.json)
* `npm run quick` — check validation status 
* `npm run validate` — generate HTML reports for validation tests &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-validation/output/)
* `npm run compare` — generate pair-wise HTML reports for registered labels &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-compare/output/)
* `npm run breakdown` — generate HTML reports for normalization error types &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-breakdown/output-20230226/)
* `npm run langs` — check that JS, CS, Java, and Go implementations match on all known labels

#### NPM Configuration
```sh
npm i ethers@latest
npm i ethers5@npm:ethers@5 --no-audit
```
