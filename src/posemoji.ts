import * as posenet from "@tensorflow-models/posenet";
import { PoseNet } from "@tensorflow-models/posenet";
import { draw } from "./draw";

const video = document.querySelector(".pose__video") as HTMLVideoElement;
const canvas = document.querySelector(".pose__canvas") as HTMLCanvasElement;

function setupVideo(): Promise<HTMLVideoElement> {
  return navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
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
  Promise.all([setupVideo(), setupPosenet()]).then(
    ([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
      const { width, height } = setDimensions(video, canvas);
      draw(net, video, canvas, width, height);
    }
  );
}

init();
