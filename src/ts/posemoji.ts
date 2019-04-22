import * as posenet from "@tensorflow-models/posenet";
import { PoseNet } from "@tensorflow-models/posenet";
import { selectDOM } from "./dom-selectors";
import { draw } from "./draw";

let stream: MediaStream;
selectDOM.camSelect.onchange = getStream;

function getStream(e) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        deviceId: { exact: selectDOM.camSelect.value }
      }
    })
    .then(gotStream);
}

function gotStream(stream) {
  stream = stream;
  selectDOM.video.srcObject = stream;
}

function setupVideo(): Promise<HTMLVideoElement> | null {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    selectDOM.error.innerHTML =
      "webcam access is not supported by this browser";
    return;
  }
  return navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "user" }, audio: false })
    .then(stream => {
      selectDOM.video.srcObject = stream;
      return new Promise(resolve => {
        selectDOM.video.onloadedmetadata = () => {
          selectDOM.video.play();
          resolve(selectDOM.video);
        };
      });
    });
}

function setupPosenet(): Promise<PoseNet> {
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
  setupCameraOptions()
    .then(() => Promise.all([setupVideo(), setupPosenet()]))
    .then(([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
      const { width, height } = setDimensions(video, selectDOM.canvas);
      draw(net, video, selectDOM.canvas, width, height);

      selectDOM.body.classList.add("loaded");
      selectDOM.audio.play();
    });
}

addEventListener("DOMContentLoaded", init);
