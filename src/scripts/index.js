import '../styles/index.scss';
import Maze from './Maze.js';



document.getElementById('opencv').onload = () => {
    cv['onRuntimeInitialized'] = () => {

        // document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
        // let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        // let cameraStream;

        let video = document.getElementById("video_input");

        // getUserMedia.call(navigator, {
        //     video: true,
        //     audio: false //optional
        // }, function (stream) {
        //     /*
        //     Here's where you handle the stream differently. Chrome needs to convert the stream
        //     to an object URL, but Firefox's stream already is one.
        //     */
        //     if (window.webkitURL) {
        //         video.src = window.webkitURL.createObjectURL(stream);
        //     } else {
        //         video.src = stream;
        //     }

        //     //save it for later
        //     cameraStream = stream;

        //     video.play();


        // },
        //  function (){console.warn("Error getting audio stream from getUserMedia")}
        // );


        // navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        //     .then((stream) => {
        //         video.srcObject = stream;
        //         video.play();
        //     })
        //     .catch((err) => {
        //         //         // TODO here error about two cameras
        //         console.log("An error occurred! " + err);
        //     });



        var constraints = {
            audio: false,
            video: true
        };
        // var video = document.querySelector("video");

        function successCallback(stream) {
            video.srcObject = stream;
            video.play();
            // document.getElementById('status').innerHTML = 'dziala kamera.';


            video.addEventListener('canplaythrough', () => {

                const cnvs = [
                    'video_input',
                    'canvas_output_labirynth',
                    'canvas_output_solved_path',
                    'canvas_output_green_points'
                ];

                for (const cnv of cnvs) {
                    document.getElementById(cnv).width = video.offsetWidth;
                    document.getElementById(cnv).height = video.offsetHeight;
                }

                document.getElementById('container').style.width = video.offsetWidth + "px";
                document.getElementById('container').style.height = video.offsetHeight + "px";

                document.getElementById('panel').style.width = video.offsetWidth + "px";

                const maze = new Maze(video);
                maze.start();
            });
        }

        function errorCallback(error) {
            console.log("navigator.getUserMedia error: ", error);
        }

        if (!navigator.mediaDevices) {

            document.getElementById('status').innerHTML = "navigator.mediaDevices is undefined";
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(successCallback)
            .catch(errorCallback);


    };
};