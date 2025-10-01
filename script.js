const video = document.getElementById("video");
const startButton = document.getElementById("startBtn");
const stopButton = document.getElementById("stopBtn");
const showModalButton = document.getElementById("showModalBtn");
const closeChart = document.getElementById("closeChart");
const chartDiv = document.getElementById("chartDiv");
const closeBtn = document.createElement("button"); // Create button element when result chart is shown
const resDiv = document.getElementById("resDiv");

const happyCount = [];
const angryCount = [];
const neutralCount = [];
const emotions = [];
let mediaStream;

startButton.style.display = "none";
stopButton.style.display = "none";
showModalButton.style.display = "none";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);

function stopWebcam() {
  const tracks = mediaStream.getTracks();
  tracks.forEach((track) => track.stop());
  window.alert(
    `Happy: ${happyCount.length} - Angry: ${angryCount.length} - Neutral: ${neutralCount.length}`
  );
  const resultsArray = [
    happyCount.length,
    angryCount.length,
    neutralCount.length,
  ];

  localStorage.setItem("resultsArray", JSON.stringify(resultsArray));

  window.location.reload();
}
function pauseStream() {
  video.pause();
  video.currentTime = 0;
  stopWebcam();
}

stopButton.addEventListener("click", () => {
  pauseStream();
});

function startVideo() {
  startButton.style.display = "block";

  startButton.addEventListener("click", () => {
    navigator.getUserMedia(
      { video: {} },
      (stream) => {
        mediaStream = stream;
        video.srcObject = stream;
      },
      (err) => console.error(err)
    );
    stopButton.style.display = "block";
    startButton.style.display = "none";
  });
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

    if (resizedDetections[0].expressions.happy >= 0.54) {
      happyCount.push(resizedDetections[0].expressions.happy);
    }
    if (resizedDetections[0].expressions.angry >= 0.72) {
      angryCount.push(resizedDetections[0].expressions.angry);
    }
    if (resizedDetections[0].expressions.neutral >= 0.55) {
      neutralCount.push(resizedDetections[0].expressions.neutral);
    }

    //  }, 100);
  }, 600);
});

//============

document.addEventListener("DOMContentLoaded", function () {
  // Fetch data from localStorage
  const summary = localStorage.getItem("resultsArray");

  // Check if data exists
  if (summary !== null) {
    // Parse the data if it's in JSON format
    const parsedData = JSON.parse(summary);

    // Use the data (e.g., display it on the page)

    showModalButton.style.display = "block";

    showModalButton.addEventListener("click", () => {
      document.getElementById("captureDiv").style.display = "none";
      resDiv.style.display = "block";
      chartDiv.style.display = "block";

      new Chart(chartDiv, {
        type: "doughnut",
        data: {
          labels: ["Smiling", "Frowning", "Neutral"],
          datasets: [
            {
              //  label: ["Smiling", "Frowning", "Neutral"],
              data: parsedData,
              backgroundColor: [
                "rgb(0, 255,0)",
                "rgb(255,0,0)",
                "rgb(151,151,151)",
              ],
              //  borderWidth: 1,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          // scales: {
          //   y: {
          //     beginAtZero: true,
          //   },
          // },
        },
      });

      closeBtn.setAttribute("id", "closeBtn"); // Set an ID attribute
      closeBtn.setAttribute("type", "button"); // Set type attribute
      closeBtn.setAttribute("style", "background-color:red");
      closeBtn.textContent = "Close"; // Set button text
      document.getElementById("resDiv").appendChild(closeBtn); // Append button to the div containing chart

      closeBtn.addEventListener("click", () => {
        document.getElementById("resDiv").style.display = "none";
        document.getElementById("chartDiv").style.display = "none";
        document.getElementById("captureDiv").style.display = "block";
      });
    });
  } else {
    console.log("No data found in localStorage.");
  }
});
