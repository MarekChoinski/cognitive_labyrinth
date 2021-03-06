import '../styles/index.scss';
import Maze from './Maze.js';



document.getElementById('opencv').onload = () => {
    cv['onRuntimeInitialized'] = () => {


        let video = document.getElementById("video_input");



        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log("enumerateDevices() not supported."); //TODO should be bug
            return;
        }

        // List cameras and microphones.

        let availableCameras = [];
        let actualCameraIndex = 0;

        let actualStream;



        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {

                // count cameras
                devices.forEach((device) => {
                    if (device.kind == 'videoinput') {
                        availableCameras.push(device.deviceId);
                    }
                });

                // add listener
                document.getElementById('flip_camera_button').addEventListener("click", () => {
                    if (availableCameras.length > 1) {
                        actualCameraIndex = actualCameraIndex == 1 ? 0 : 1;

                        actualStream.getTracks().forEach(track => {
                            track.stop();
                        });

                        navigator.mediaDevices.getUserMedia(constraints)
                            .then(successCallback)
                            .catch(errorCallback);

                            document.getElementById('status').innerHTML = availableCameras[0] + '<br/>' + availableCameras[1];
                            // document.getElementById('status').innerHTML = availableCameras.length;
                    }
                    console.log(actualStream);


                });

                //start first
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(successCallback)
                    .catch(errorCallback);

            })
            .catch((err) => {
                console.log(err.name + ": " + err.message);
            });



        let constraints = {
            audio: false,
            video: {
                deviceId: {
                    exact: availableCameras[actualCameraIndex]
                },
                advanced: [{
                    facingMode: "environment"
                }]
            }
        };
        // var video = document.querySelector("video");

        function successCallback(stream) {
            actualStream = stream;
            video.srcObject = stream;
            video.play();

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

                const gui = [
                    'container',
                    'loading',
                    'panel'
                ];

                for (const el of gui) {
                    document.getElementById(el).classList += " loaded";
                }

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

        // navigator.mediaDevices.getUserMedia(constraints)
        //     .then(successCallback)
        //     .catch(errorCallback);


    };
};