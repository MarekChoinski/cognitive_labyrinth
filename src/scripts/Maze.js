export default class Maze {
    constructor(video) {
        // this.video = video;
        this.src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.cap = new cv.VideoCapture(video);

        this.FPS = 20;
    }

    start() {


        // schedule the first one.
        processVideo();
    }

    processVideo() {
        try {
            let begin = Date.now();
            this.cap.read(this.src);
            cv.cvtColor(this.src, this.dst, cv.COLOR_RGBA2GRAY);
            cv.imshow('canvas_output', this.dst);

            // TODO i don't like this fetch Date.now. It is optimal?
            setTimeout(processVideo, 1000 / this.FPS - (Date.now() - begin));
        } catch (err) {
            console.log(err);
        }
    };
}
