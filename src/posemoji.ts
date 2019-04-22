import * as posenet from "@tensorflow-models/posenet";
import { PoseNet } from "@tensorflow-models/posenet";
import { draw } from "./draw";
import { domSelectors } from "./dom-selectors";

let stream: MediaStream;
domSelectors.camSelect.onchange = getStream;

function getStream(e) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        deviceId: { exact: domSelectors.camSelect.value }
      }
    })
    .then(gotStream);
}

function gotStream(stream) {
  stream = stream;
  domSelectors.video.srcObject = stream;
}

function setupVideo(): Promise<HTMLVideoElement> | null {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    domSelectors.error.innerHTML =
      "webcam access is not supported by this browser";
    return;
  }
  return navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "user" }, audio: false })
    .then(stream => {
      domSelectors.video.srcObject = stream;
      return new Promise(resolve => {
        domSelectors.video.onloadedmetadata = () => {
          domSelectors.video.play();
          resolve(domSelectors.video);
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
        domSelectors.camSelect.appendChild(option);
      });
    });
}

function setLoaded() {
  domSelectors.body.classList.add("loaded");
}

function init() {
  setupCameraOptions()
    .then(() => Promise.all([setupVideo(), setupPosenet()]))
    .then(([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
      const { width, height } = setDimensions(video, domSelectors.canvas);
      draw(net, video, domSelectors.canvas, width, height);
      domSelectors.audio.play();
      setLoaded();
    });
}

addEventListener("DOMContentLoaded", init);
