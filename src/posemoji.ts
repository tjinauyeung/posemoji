import * as posenet from "@tensorflow-models/posenet";
import { PoseNet } from "@tensorflow-models/posenet";
import { draw } from "./draw";

const video = document.querySelector(".posemoji__video") as HTMLVideoElement;
const canvas = document.querySelector(".posemoji__canvas") as HTMLCanvasElement;
const error = document.querySelector(".posemoji__err") as HTMLParagraphElement;
const camSelect = document.querySelector(
  ".posemoji__cam-select"
) as HTMLSelectElement;

let stream: MediaStream;
camSelect.onchange = getStream;

function getStream(e) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    audio: false,
    video: {
      deviceId: { exact: camSelect.value }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(gotStream);
}

function gotStream(stream) {
  stream = stream; // make stream available to console
  video.srcObject = stream;
}

function setupVideo(): Promise<HTMLVideoElement> | null {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    error.innerHTML = "webcam access is not supported by this browser";
    return;
  }

  return navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "user" }, audio: false })
    .then(stream => {
      video.srcObject = stream;
      return new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(video);
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

function init() {
  setupCameraOptions().then(() => {
    Promise.all([setupVideo(), setupPosenet()]).then(
      ([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
        const { width, height } = setDimensions(video, canvas);
        draw(net, video, canvas, width, height);
      }
    );
  });
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
        camSelect.appendChild(option);
      });
    });
}

init();
