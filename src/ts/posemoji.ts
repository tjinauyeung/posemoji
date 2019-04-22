import * as posenet from "@tensorflow-models/posenet";
import { selectDOM } from "./dom-selectors";
import { draw } from "./draw";

let videoStream: MediaStream;

function setupVideo(): Promise<HTMLVideoElement> | null {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    selectDOM.error.innerHTML =
      "webcam access is not supported by this browser";
    return;
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
    video: { facingMode: "user" }
  };
}

function setupPosenet(): Promise<posenet.PoseNet> {
  return posenet.load(0.75);
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
  return navigator.mediaDevices
    .enumerateDevices()
    .then(getCameraDevices)
    .then(cameraDevices => {
      cameraDevices.forEach(device => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.text = device.label;
        selectDOM.camSelect.appendChild(option);
      });
    });
}

function init() {
  return (
    Promise.all([setupVideo(), setupPosenet()])
      .then(([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
        const { width, height } = setDimensions(video, selectDOM.canvas);
        draw(net, video, selectDOM.canvas, width, height);

        // show content and start music
        selectDOM.body.classList.add("loaded");
        selectDOM.audio.play();
      })
      // tslint:disable-next-line
      .catch(e => console.re.log(e))
  );
}

selectDOM.camSelect.addEventListener("change", init);

window.addEventListener("DOMContentLoaded", () => {
  setupCameraOptions();
  init();
});

// tslint:disable-next-line
console.re.log("Connected to remote logging service");
