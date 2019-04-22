import { selectDOM } from "./dom-selectors";

let videoStream: MediaStream;

export function setupVideo(): Promise<HTMLVideoElement> | null {
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

const getCameraDevices = devices =>
  devices.filter(device => device.kind === "videoinput");

const isPreviouslySelected = (options: NodeList, selectedVal) =>
  Array.prototype.slice.call(options).some(node => node.value === selectedVal);

export function setupCameraOptions() {
  return navigator.mediaDevices
    .enumerateDevices()
    .then(getCameraDevices)
    .then(cameraDevices => {
      const selectedValue = selectDOM.camSelect.value;
      // remove select options
      while (selectDOM.camSelect.firstChild) {
        selectDOM.camSelect.removeChild(selectDOM.camSelect.firstChild);
      }
      // replace select options
      cameraDevices.forEach(getOption);
      // set select to previous value
      if (isPreviouslySelected(selectDOM.camSelect.childNodes, selectedValue)) {
        selectDOM.camSelect.value = selectedValue;
      }
    })
    .catch(e => {
      throw new Error(e);
    });
}

function getOption(device: MediaDeviceInfo) {
  const option = document.createElement("option");
  option.value = device.deviceId;
  option.text = device.label;
  selectDOM.camSelect.prepend(option);
}
