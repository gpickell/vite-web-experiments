


This is an experiment to see if we can use Vite as a dev experience.

Feats:
- Dynamically load from CDN
- Remove the use of the IFRAME
- Hoist external-AMD *stuff*
- Reparse imports into hoisted AMD counterparts
- Vite plugin to do all the magic

TODO:
- Make prod build (should be possible with vite or pure rollup)
- Figure out why vite-react-refresh/react-refresh as this is the major benefit of vite

Startup:
```
cd vite-test
yarn
yarn dev
```
