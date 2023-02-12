# INFO
This is an experiment to see if we can use Vite as a dev/build experience.

## FEATS:
- Dynamically load from CDN
- Remove the use of the IFRAME
- Hoist external-AMD *stuff*
- Selectively, reparse imports into hoisted AMD counterparts
- Vite plugin to do all the magic
- HMR Support

## TODO:
- Make prod build (should be easy with vite or pure rollup)

Startup:
```
cd vite-test
yarn
code .
yarn dev
```
