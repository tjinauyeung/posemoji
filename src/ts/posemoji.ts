import * as posenet from "@tensorflow-models/posenet";
import { selectDOM } from "./dom-selectors";
import { draw } from "./draw";

let videoStream: MediaStream;

function setupVideo(): Promise<HTMLVideoElement> | null {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    selectDOM.video.srcObject = null;
  }

  return navigator.mediaDevices.getUserMedia(getConstraints()).then(stream => {
    videoStream = stream;
    selectDOM.video.srcObject = stream;

    return new Promise(resolve => {
      selectDOM.video.onloadedmetadata = () => {
        selectDOM.video.play();
        resolve(selectDOM.video);
      };
    });
  });
}

function getConstraints() {
  if (videoStream) {
    return {
      audio: false,
      video: { deviceId: { exact: selectDOM.camSelect.value } }
    };
  }
  return {
    audio: false,
    video: true
  };
}

function setupPosenet(): Promise<posenet.PoseNet> {
  return posenet.load(0.5);
}

function setDimensions(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): {
  width: number;
  height: number;
} {
  const { width, height } = video.getBoundingClientRect();
  video.width = width;
  video.height = height;
  canvas.width = width;
  canvas.height = height;
  return { width, height };
}

const getCameraDevices = devices =>
  devices.filter(device => device.kind === "videoinput");

function setupCameraOptions() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    throw new Error(
      "Browser API navigator.mediaDevices.enumerateDevices not available"
    );
  }

  return navigator.mediaDevices
    .enumerateDevices()
    .then(getCameraDevices)
    .then(cameraDevices => {
      for (let i = 0; i !== cameraDevices.length; ++i) {
        const device = cameraDevices[i];
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.text =
          device.label || `camera ${selectDOM.camSelect.length + 1}`;
        selectDOM.camSelect.appendChild(option);
      }
    })
    .catch(e => {
      throw new Error(e);
    });
}

function start() {
  return Promise.all([setupVideo(), setupPosenet()])
    .then(([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
      const { width, height } = setDimensions(video, selectDOM.canvas);
      draw(net, video, selectDOM.canvas, width, height);
      // show content and start music
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
    setupCameraOptions();
    start();
  } catch (e) {
    selectDOM.error.innerText =
      "demo does not run on your device, try running on chrome on desktop";
    // tslint:disable-next-line
    console.re.log("failed to start project with", e);
  }
});

// Using `https://console.re/posemoji` for remote logging
// tslint:disable-next-line
console.re.log("connected to remote logging service");
