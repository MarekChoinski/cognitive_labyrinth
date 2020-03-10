import '../styles/index.scss';

let video = document.getElementById("videoInput"); // video is the id of video tag
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function (stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function (err) {
        console.log("An error occurred! " + err);
    });

console.log("xd");

let openCV = document.getElementById('opencv');
openCV.onload = () => {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
};