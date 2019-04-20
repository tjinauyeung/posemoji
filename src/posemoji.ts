import * as posenet from "@tensorflow-models/posenet";

const video = document.querySelector(".pose__video") as HTMLVideoElement;

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

function setupPosenet() {
  posenet.load(0.75).then(net => {});
}

setupVideo();
setupPosenet();
