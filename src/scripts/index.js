import '../styles/index.scss';
import Maze from './Maze.js';



document.getElementById('opencv').onload = () => {
    cv['onRuntimeInitialized'] = () => {

        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
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
            document.getElementById('status').innerHTML = 'dziala kamera.';


            video.addEventListener('canplaythrough', () => {

                document.getElementById('size_p').innerHTML = 'off height: '+video.offsetHeight + ' width: '+video.offsetWidth;
                
                document.getElementById('video_input').width = video.offsetWidth;
                document.getElementById('video_input').height = video.offsetHeight;


                document.getElementById('canvas_output_labirynth').width = video.offsetWidth;
                document.getElementById('canvas_output_labirynth').height = video.offsetHeight;

                document.getElementById('canvas_output_solved_path').width = video.offsetWidth;
                document.getElementById('canvas_output_solved_path').height = video.offsetHeight;

                document.getElementById('canvas_output_green_points').width = video.offsetWidth;
                document.getElementById('canvas_output_green_points').height = video.offsetHeight;

                const maze = new Maze(video);
                maze.start();
            });
        }

        function errorCallback(error) {
            console.log("navigator.getUserMedia error: ", error);
        }
        
        if(!navigator.mediaDevices){
            
            document.getElementById('status').innerHTML = "navigator.mediaDevices is undefined";
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(successCallback)
            .catch(errorCallback);


    };
};