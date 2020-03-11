import '../styles/index.scss';



document.getElementById('opencv').onload = () => {
    cv['onRuntimeInitialized'] = () => {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

        let video = document.getElementById("videoInput"); // video is the id of video tag
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err) {
                // TODO here error about two cameras
                console.log("An error occurred! " + err);
            });

        // let video = document.getElementById('videoInput');


        video.addEventListener('canplaythrough', () => {

            console.log(video);

            console.log(video.height);
            console.log(video.width);
            let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
            let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
            let cap = new cv.VideoCapture(video);

            console.log(src);
            console.log(dst);
            console.log(cap);


            const FPS = 30;
            function processVideo() {
                try {
                    //         // if (!streaming) {
                    //         // clean and stop.
                    //         // src.delete();
                    //         // dst.delete();
                    //         // return;
                    //         // }
                    let begin = Date.now();
                    //         // start processing.
                    cap.read(src);
                    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                    cv.imshow('canvasOutput', dst);
                    //         // schedule the next one.
                    let delay = 1000 / FPS - (Date.now() - begin);
                    setTimeout(processVideo, delay);
                } catch (err) {
                    //         // utils.printError(err);
                    console.log(err);

                }
            };

            // schedule the first one.
            setTimeout(processVideo, 0);
        });


    };
};