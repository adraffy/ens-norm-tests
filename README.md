# ENS Name Normalization Implementation Tests

*Work in Progress*

## Implementations

* [@adraffy/ens-norm-ref-impl](https://github.com/adraffy/ens-norm-ref-impl.js) &rarr; `[Reference]`
* [@adraffy/ens-norm-uts46](https://github.com/adraffy/ens-norm-uts46.js) &rarr; `[ENS0, UTS46, Strict2008]`
* [@ensdomains/eth-ens-namehash](https://github.com/ensdomains/eth-ens-namehash) &rarr; `[eth-ens-namehash]`
* [@adraffy/ens-normalize](https://github.com/adraffy/ens-normalize.js) &rarr; `[ens_normalize]`

## Data Files

* [`eth-labels/db.json`](./eth-labels/db.json) &mdash; `1,413,868` registered labels as of `2022-08-01`

## Generated Reports

* [Validation](./test-validation/output/) &mdash; validation test errors for each implementation
* [Compare: `f vs g`](./test-comparison/output/) &mdash; side-by-side errors for each pair of implementations
* Composition: `f(g(x)) vs f(x)`

## Commands

* `npm run valid-report` generate HTML reports for validation tests
* `npm run compare-report` generate pair-wise HTML reports for registered labels