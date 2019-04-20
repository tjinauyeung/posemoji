import { Keypoint, PoseNet } from "@tensorflow-models/posenet";

const CANVAS_FONT = "80px Verdana";
const EMOJI_OFFSET = 40;

const isLeftEye = (kp: Keypoint): boolean => kp.part === "leftEye";
const isRightEye = (kp: Keypoint): boolean => kp.part === "rightEye";
const isEye = (kp: Keypoint): boolean => isLeftEye(kp) || isRightEye(kp);

export function draw(
  net: PoseNet,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const ctx = canvas.getContext("2d");
  const scaleFactor = 0.5;
  const flipHorizontal = false;
  const outputStride = 16;

  net
    .estimateSinglePose(video, scaleFactor, flipHorizontal, outputStride)
    .then(({ keypoints }) => {
      // wipe canvas before drawing
      ctx.clearRect(0, 0, width, height);

      // draw video for responsiveness
      ctx.drawImage(video, 0, 0, width, height);

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
    draw(net, video, canvas, width, height);
  });
}
