# ENS Name Normalization Implementation Tests

*Work in Progress*

## Implementations

* [@adraffy/ens-norm-ref-impl](https://github.com/adraffy/ens-norm-ref-impl.js) &rarr; `[Reference]`
* [@adraffy/ens-norm-uts46](https://github.com/adraffy/ens-norm-uts46.js) &rarr; `[ENS0, UTS46, Strict2008]`
* [@ensdomains/eth-ens-namehash](https://github.com/ensdomains/eth-ens-namehash) &rarr; `[eth-ens-namehash]`
* [@adraffy/ens-normalize](https://github.com/adraffy/ens-normalize.js) &rarr; `[ens_normalize]`

## Data Files

* [`eth-labels/db.json`](./eth-labels/db.json) &mdash; `1,413,868` registered labels as of `2022-08-01`

## Commands

* `npm run impls` print normalization function lineup
* `npm run idempotence` check if `f(f(x)) == f(x)`
* `npm run uts46` determine where `f(uts46(x)) != f(x)` &rarr; [json](./test-misc/output/uts46.json)
* `npm run valid-report` generate HTML reports for validation tests &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-validation/output/)
* `npm run compare-report` generate pair-wise HTML reports for registered labels &rarr; [html](https://adraffy.github.io/ens-norm-tests/test-compare/output/)