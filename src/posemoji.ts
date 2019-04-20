import * as posenet from "@tensorflow-models/posenet";
import { Keypoint, PoseNet } from "@tensorflow-models/posenet";

const video = document.querySelector(".pose__video") as HTMLVideoElement;
const canvas = document.querySelector(".pose__canvas") as HTMLCanvasElement;

const CANVAS_FONT = "80px Verdana";
const EMOJI_OFFSET = 40;

const isLeftEye = (kp: Keypoint): boolean => kp.part === "leftEye";
const isRightEye = (kp: Keypoint): boolean => kp.part === "rightEye";
const isEye = (kp: Keypoint): boolean => isLeftEye(kp) || isRightEye(kp);

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

function setOutputDimensions(
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

function getPose(net, video, canvas, width, height) {
  const ctx = canvas.getContext("2d");
  const scaleFactor = 0.5;
  const flipHorizontal = false;
  const outputStride = 16;

  net
    .estimateSinglePose(video, scaleFactor, flipHorizontal, outputStride)
    .then(({ keypoints }) => {
      // wipe canvas before drawing
      ctx.clearRect(0, 0, width, height);

      keypoints.forEach(kp => {
        if (isEye(kp)) {
          let { x, y } = kp.position;

          x = x - EMOJI_OFFSET;
          y = y + EMOJI_OFFSET;

          ctx.font = CANVAS_FONT;
          ctx.fillText("❤️", x, y);
        }
      });
    });

  requestAnimationFrame(() => {
    getPose(net, video, canvas, width, height);
  });
}

function bootstrap() {
  Promise.all([setupVideo(), setupPosenet()]).then(
    ([video, net]: [HTMLVideoElement, posenet.PoseNet]) => {
      const { width, height } = setOutputDimensions(video, canvas);
      getPose(net, video, canvas, width, height);
    }
  );
}

bootstrap();
