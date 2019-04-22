import { Keypoint, PoseNet } from "@tensorflow-models/posenet";
import { getRandomInt } from "./utils";
import { Heart } from "./models";

const CANVAS_FONT = "60px Verdana";
const EMOJI_OFFSET = 30;
const EMOJI_HEART = "♥️";
const EMOJI_EYE = "❤️";
const MINIMUM_CONFIDENCE_LEVEL = 0.8;

const isEye = (kp: Keypoint): boolean =>
  kp.part === "leftEye" || kp.part === "rightEye";

let requestAnimationFrameId: number;

export function draw(
  net: PoseNet,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
) {
  cancelAnimationFrame(requestAnimationFrameId);

  const { width, height } = calculateDimensions(video, canvas);
  const ctx = canvas.getContext("2d");
  const hearts = getHearts(50, width, height);

  function drawEmojis() {
    net.estimateSinglePose(video, 0.5, false, 16).then(({ keypoints }) => {
      // wipe canvas before drawing
      ctx.clearRect(0, 0, width, height);
      // draw video in canvas to have responsive video
      ctx.drawImage(video, 0, 0, width, height);
      // draw emojis
      keypoints
        .filter(kp => isEye(kp) && kp.score >= MINIMUM_CONFIDENCE_LEVEL)
        .forEach(kp => drawEyes(ctx, kp));
      hearts.forEach(heart => drawFloatingHearts(ctx, heart));
    });

    requestAnimationFrameId = requestAnimationFrame(drawEmojis);
  }

  drawEmojis();
}

function calculateDimensions(
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

function drawEyes(ctx: CanvasRenderingContext2D, kp: Keypoint) {
  let { x, y } = kp.position;
  x = x - EMOJI_OFFSET;
  y = y + EMOJI_OFFSET;
  ctx.font = CANVAS_FONT;
  ctx.fillText(EMOJI_EYE, x, y);
}

function drawFloatingHearts(ctx: CanvasRenderingContext2D, heart: Heart) {
  ctx.font = heart.font;
  ctx.fillText(heart.emoji, heart.x, heart.y);
  heart.y = heart.y - heart.yVelocity;
}

function getHearts(length: number, width: number, height: number): Heart[] {
  return Array.from({ length }).map(() => getHeart(width, height));
}

function getHeart(width: number, height: number): Heart {
  return {
    emoji: EMOJI_HEART,
    font: `${getRandomInt(20, 40)}px Verdana`,
    x: getRandomInt(0, width),
    y: getRandomInt(0, height) + height,
    yVelocity: getRandomInt(1, 5)
  };
}
