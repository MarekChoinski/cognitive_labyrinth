import '../styles/index.scss';
import Maze from './Maze.js';

document.getElementById('opencv').onload = () => {
    cv['onRuntimeInitialized'] = () => {

        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

        // let video = document.getElementById("video_input");
        // navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        //     .then((stream) => {
        //         video.srcObject = stream;
        //         video.play();
        //     })
        //     .catch((err) => {
        //         // TODO here error about two cameras
        //         console.log("An error occurred! " + err);
        //     });

        // video.addEventListener('canplaythrough', () => {



        // let video = cv.imread('canvas_input');
        let video = document.getElementById("canvas_input");
        video.crossOrigin = "Anonymous";
        const maze = new Maze(video);
        maze.start();




        // });


    };
};