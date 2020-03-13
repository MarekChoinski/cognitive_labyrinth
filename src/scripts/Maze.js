export default class Maze {


    constructor(video) {
        // this.video = video;
        this.frame_from_video = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.labirynth_mask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.cap = new cv.VideoCapture(video);

        this.FPS = 20;
        this.sensivity_of_geeting_labirynth = 110;

        this.circles = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));
        //this.labirynth_mask = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));
        this.circles_mask = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));

        this.lower_green = [40, 100, 85, 0];
        this.upper_green = [75, 255, 255, 255];

    }

    showVideo() {
        try {
            // get camera_frame
            this.cap.read(this.frame_from_video);

            // let dst = this.frame_from_video;
            let dist = this.labirynth_mask;
            // let dst = this.labirynth_mask;



            cv.imshow('canvas_output', dist);
            // this.frame_from_video.delete();
        } catch (err) {
            console.log(err);
        }
    }

    // we should find position of end points
    // there could be a lot of green elements on frame
    // so we should find two the biggest
    // returns position of start and end and diameter of found point
    find_position_of_end_points() {

    }

    calculateMaze() {

        try {
            // get grame frame
            // let gray = new cv.Mat();
            let gray = new cv.Mat();
            // console.log(gray);

            cv.cvtColor(this.frame_from_video, gray, cv.COLOR_RGBA2GRAY, 0);
            // threshold image to ge only black labirynth
            cv.threshold(gray, this.labirynth_mask, this.sensivity_of_geeting_labirynth, 255, cv.THRESH_BINARY);

            let low = new cv.Mat(this.frame_from_video.rows, this.frame_from_video.cols, this.frame_from_video.type(), this.lower_green);
            let high = new cv.Mat(this.frame_from_video.rows, this.frame_from_video.cols, this.frame_from_video.type(), this.upper_green);
            // You can try more different parameters
            cv.inRange(this.frame_from_video, low, high, this.dst);

            low.delete();
            high.delete();
            gray.delete();
        } catch (error) {
            // console.log(error);

        }


    }

    start() {
        setInterval(() => this.showVideo(), 1000 / this.FPS);
        setInterval(() => this.calculateMaze(), 0);
    }

    //todo
    // free(){
    //     clearInterval(refreshIntervalId);
    //     clearInterval(refreshIntervalId);
    // src.delete(); dst.delete();
    // }


}
