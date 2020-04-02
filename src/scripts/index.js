import '../styles/index.scss';
import Maze from './Maze.js';



document.getElementById('opencv').onload = () => {
    cv['onRuntimeInitialized'] = () => {

        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

        let video = document.getElementById("video_input");
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                //         // TODO here error about two cameras
                console.log("An error occurred! " + err);
            });

        video.addEventListener('canplaythrough', () => {


            // const FPS = 24;

            // const show = (video) => {
            //     let canvas = document.getElementById("canvas_output");
            //     let ctx = canvas.getContext('2d');
            //     ctx.clearRect(0, 0, canvas.width, canvas.height);

            //     const maze = new Maze(video);

            //     maze.solve();

            //     ctx.drawImage(video, 0, 0, video.width, video.height);
            // };

            // setInterval(
            //     () => show(video),
            //     (1000 / FPS)
            // );

            //   function snapshot() {
            // Draws current image from the video element into the canvas

            // let video = cv.imread('canvas_input');
            // let video = document.getElementById("canvas_input");
            // video.crossOrigin = "Anonymous";
            const maze = new Maze(video);
            maze.start();




        });


    };
};