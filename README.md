### Posemoji

App using Tensorflow.js to analyse poses using the users webcam

#### Commands

Run project

```
npm run start
```

Build project
```
npm run build
```

#### Requirements

- [x] Use Media Devices API to access a camera.
- [x] Use TensorFlow.js with a pre-trained model to detect human poses.
- [] The app should work on the newest stable version of a Chrome browser, both mobile and desktop.
- [x] Choose both emojis and body parts freely.
- [x] The app should scale content to fit a window.
- [] There must be a single button to switch between all available cameras. (WIP)
- [x] Host the app on a free hosting under a public domain, e.g. GitHub Pages or Firebase Hosting.

#### TODO
- [] The app should work on the newest stable version of a Chrome browser, both mobile and desktop.
  - App only works on desktop; Safari and Chrome on iphone does not support `navigator.mediaDevices`
- [] There must be a single button to switch between all available cameras. (WIP)

Refactor
- [] Use async await instead of promises
