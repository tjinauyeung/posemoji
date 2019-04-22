import * as posenet from "@tensorflow-models/posenet";
import { setupCameraOptions, setupVideo } from "./camera";
import { selectDOM } from "./dom-selectors";
import { draw } from "./draw";

function start(): Promise<any> {
  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia ||
    !navigator.mediaDevices.enumerateDevices
  ) {
    throw new Error(`
      browser does not support features i.e.
      mediaDevices.getUserMedia or mediaDevices.enumerateDevices
    `);
  }

  return Promise.all([setupVideo(), posenet.load(0.5)])
    .then(([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
      draw(net, video, selectDOM.canvas);
    })
    .then(setupCameraOptions)
    .then(() => {
      selectDOM.body.classList.add("loaded");
      selectDOM.audio.play();
    })
    .catch(e => {
      throw new Error(e);
    });
}

selectDOM.camSelect.addEventListener("change", start);

window.addEventListener("DOMContentLoaded", () => {
  try {
    start();
  } catch (e) {
    selectDOM.error.innerText = `
      demo does not run on your device,
      try running on chrome on desktop.
    `;
  }
});
