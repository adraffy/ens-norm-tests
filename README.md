# ENS Name Normalization Implementation Tests

## Implementations

* [@adraffy/ens-norm-ref-impl.js](https://github.com/adraffy/ens-norm-ref-impl.js) &rarr; `[Reference]`
* [@adraffy/ens-norm-uts46.js](https://github.com/adraffy/ens-norm-uts46.js) &rarr; `[ENS0, UTS46, Strict2008]`
* [@ensdomains/eth-ens-namehash](https://github.com/ensdomains/eth-ens-namehash) &rarr; `[eth-ens-namehash]`
* [@adraffy/ens-normalize.js](https://github.com/adraffy/ens-normalize.js)

## Data Files

* [`eth-labels/db.json`](./eth-labels/db.json) &mdash; `1,316,398` registered labels as of `2022-07-19`

## Generated Reports

* [Validation](./test-validation/output/) &ndash; validation test errors for each implementation
* [Compare: `f vs g`](./test-comparison/output/) &ndash; side-by-side errors for each pair of implementations
* Composition: `f(g(x)) vs f(x)`
