# INFO
This is an experiment to see if we can use Vite as a dev/build experience.

## FEATS:
- Dynamically load from CDN
- Remove the use of the IFRAME
- Hoist external-AMD *stuff*
- Selectively, reparse imports into hoisted AMD counterparts
- Vite plugin to do all the magic

## TODO:
- Make prod build (should be easy with vite or pure rollup)
- Figure out why vite-react-refresh/react-refresh is broken

## HMR NOTES:
Normally, aside from css, Vite will reload the browser on code edits. There
is a plugin which is supposed to enable fast-refresh/hot-reload for React
components, but this doesn't work in our stack. The hot-reload feature of Vite
is working, but the react-refresh runtime does not seem to understand that it
needs to update. Other than being a new tool, there isn't enough reason to
care about Vite if we don't have this.

Possible Reasons:
- react-refresh is being applied to *our code* and needs to be applied to the root as well
- react itself needs should be *dev mode* but it is bundled with web
- web may be orchestrating react in some unorthodox ways

Possible Fixes:
- Hack in our own orchestration of react-refresh
- Hack in our own incarnation of react-refresh
- Spot weld something in for each component we care about (see PointsOfInterest.tsx)
- Make web a proper react component and have the project own the bootstrapping

Technically, the last one would be the "most sound" and "industry aware" solution, but
this would be *really* difficult.

Startup:
```
cd vite-test
yarn
code .
yarn dev
```
