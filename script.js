const video = document.getElementById("video");
const happyCount = [];
const angryCount = [];
const neutralCount = [];
const emotions = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      // .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    console.log("Detected: ", resizedDetections[0].expressions.happy);
    if (resizedDetections[0].expressions.happy >= 0.9) {
      happyCount.push(resizedDetections[0].expressions.happy);
    }
    if (resizedDetections[0].expressions.angry >= 0.9) {
      angryCount.push(resizedDetections[0].expressions.angry);
    }
    if (resizedDetections[0].expressions.neutral >= 0.9) {
      neutralCount.push(resizedDetections[0].expressions.neutral);
    }

    // console.log("Happys: ", resizedDetections[0].expressions);

    console.log(`Happy: ${happyCount.length}`);
    console.log(`Angry: ${angryCount.length}`);
    console.log(`Neutral: ${neutralCount.length}`);
  }, 100);
});
