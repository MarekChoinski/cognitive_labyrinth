export default class Maze {


    constructor(video) {
        // this.video = video;
        this.frame_from_video = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.labirynth_mask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.cap = new cv.VideoCapture(video);

        this.FPS = 20;
        this.sensivity_of_geeting_labirynth = 90;

        this.circles = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));
        //this.labirynth_mask = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));
        this.circles_mask = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));

        this.lower_green = [40, 100, 85];
        this.upper_green = [75, 255, 255];

    }

    showVideo() {
        try {
            // get camera_frame
            this.cap.read(this.frame_from_video);

            let dst = this.frame_from_video;



            cv.imshow('canvas_output', dst);
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
        let gray = new cv.Mat();
        cv.cvtColor(this.frame_from_video, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(gray, 255, this.labirynth_mask, this.sensivity_of_geeting_labirynth, cv.THRESH_BINARY);


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
