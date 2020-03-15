export default class Maze {


    constructor(video) {



        this.video = video;
        this.frame_from_video = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        // this.frame_from_video = cv.imread('canvas_input');
        this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.labirynth_mask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        // this.hsv_frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        // this.hsv_frame2 = new cv.Mat(video.height, video.width, cv.CV_8U);
        //this.cap = new cv.VideoCapture(video);

        this.FPS = 24;
        this.sensivity_of_geeting_labirynth = 110;

        this.circles = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));
        //this.labirynth_mask = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));
        this.circles_mask = new Array(video.height).fill().map(() => new Array(video.width).fill([0, 0, 0]));

        this.lower_green = [40, 100, 85, 0];
        this.upper_green = [75, 255, 255, 255];
        // this.lower_green = [52, 170, 52, 0];
        // this.upper_green = [235, 255, 235, 255];
    }

    showVideo() {
        try {
            // console.log(this.frame_from_video);

            // get camera_frame
            // this.cap.read(this.frame_from_video);



            // let dst = this.frame_from_video;
            // let dist = this.labirynth_mask;
            // let dst = this.labirynth_mask;

            // let dist = new cv.Mat();
            // console.log(gray);

            // cv.cvtColor(this.frame_from_video, dist, cv.COLOR_RGBA2GRAY, 0);

            // cv.imshow('canvas_output', this.labirynth_mask);



            // let hsv_frame = new cv.Mat();
            // cv.cvtColor(this.frame_from_video, hsv_frame, cv.COLOR_BGR2HSV, 0);
            // this.hsv_frame = hsv;
            // let low = new cv.Mat(hsv_frame.rows, hsv_frame.cols, hsv_frame.type(), this.lower_green);
            // let high = new cv.Mat(hsv_frame.rows, hsv_frame.cols, hsv_frame.type(), this.upper_green);


            // console.log(this.frame_from_video.channels());
            // console.log(this.hsv_frame.channels());
            // console.log();




            // let inr = new cv.Mat();
            // cv.inRange(hsv_frame, low, high, inr);
            // console.log(inr.channels());
            // console.log();

            // cv.imshow('canvas_output', inr);
            cv.imshow('canvas_output', this.labirynth_mask);
            // dist.delete();
            // this.frame_from_video.delete();

            // inr.delete();
            // hsv_frame.delete();
            // low.delete();
            // high.delete();
        } catch (err) {
            console.log(err);
        }
    }

    // we should find position of end points
    // there could be a lot of green elements on frame
    // so we should find two the biggest
    // returns position of start and end and diameter of found point
    find_position_of_end_points(points_mask) {

    }

    calculateMaze() {

        try {
            // get grame frame
            // let gray = new cv.Mat();
            let gray = new cv.Mat();
            // console.log(gray);

            cv.cvtColor(this.frame_from_video, gray, cv.COLOR_RGBA2GRAY, 0);
            // threshold image to emilinate white colors - we get only black labirynth + green points
            // let thresholded_labirynt = new cv.Mat();
            cv.threshold(gray, gray, this.sensivity_of_geeting_labirynth, 255, cv.THRESH_BINARY_INV);

            // dilatation for bolder walls of maze
            // const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
            // const anchor = new cv.Point(-1, -1);
            cv.dilate(
                gray,
                this.labirynth_mask,
                cv.Mat.ones(5, 5, cv.CV_8U),
                new cv.Point(-1, -1),
                1,
                cv.BORDER_CONSTANT,
                cv.morphologyDefaultBorderValue()
            );

            // we need to get green points mask for differentiation of labirynth mask
            let hsv = new cv.Mat();
            cv.cvtColor(this.frame_from_video, hsv, cv.COLOR_BGR2HSV, 0);
            const low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), this.lower_green);
            const high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), this.upper_green);

            let points_mask = new cv.Mat();
            cv.inRange(hsv, low, high, points_mask);
            cv.dilate(
                points_mask,
                points_mask,
                cv.Mat.ones(5, 5, cv.CV_8U),
                new cv.Point(-1, -1),
                1,
                cv.BORDER_CONSTANT,
                cv.morphologyDefaultBorderValue()
            );

            let mask = new cv.Mat();
            // let dtype = -1;
            cv.subtract(this.labirynth_mask, points_mask, this.labirynth_mask, mask, -1);

            gray.delete();
            mask.delete();
            // thresholded_labirynt.delete();
            low.delete();
            high.delete();
            hsv.delete();
            points_mask.delete();
        } catch (error) {
            console.log(error);
        }
    }

    start() {
        this.frame_from_video = cv.imread(this.video);
        console.log(this.frame_from_video);
        setInterval(() => this.showVideo(), 1000 / this.FPS);

        setInterval(() => this.calculateMaze(), 0); //TODO: probably shouldn't be faster than FPS, but idk tbh // TODO2: or make some guard variable to check if there is new frame - eg. is_new_frame = false
    }

    //todo
    // free(){
    //     clearInterval(refreshIntervalId);
    //     clearInterval(refreshIntervalId);
    // src.delete(); dst.delete();
    // }


}
