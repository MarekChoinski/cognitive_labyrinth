import Solver from "./Solver";
import {dilateImage, printError} from './utils';


//TODO: dilatate should be function 
export default class Maze {

    constructor(video) {

        this.video = video;
        // this.context = document.getElementById("canvas_output").getContext("2d");
        this.context_labirynth = document.getElementById("canvas_output_labirynth").getContext("2d");
        this.context_green_points = document.getElementById("canvas_output_green_points").getContext("2d");
        this.context_solved_path = document.getElementById("canvas_output_solved_path").getContext("2d");
        this.context_user_path = document.getElementById("canvas_output_user_path").getContext("2d");

        this.frame_from_video = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.labirynth_mask = new cv.Mat(video.offsetHeight, video.offsetWidth, cv.CV_8UC1);

        this.circles = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);
        this.solved_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.user_path = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.FPS = 1;
        this.sensivity_of_geeting_labirynth = 110;

        // ITS OPENV_HSV
        // explanation: https://stackoverflow.com/questions/17878254/opencv-python-cant-detect-blue-objects
        // this.lower_green = [40, 100, 85, 0];
        // this.upper_green = [75, 255, 255, 255];
        this.lower_green = [30, 80, 75, 0];
        this.upper_green = [85, 255, 255, 255];

        this.lower_violet = [115,50, 80, 0];
        this.upper_violet = [180,255,255, 255];

        this.green = [0, 255, 0, 128];
        this.path_color=[214, 6, 214, 255];
    }

    // we should find position of end points
    // there could be a lot of green elements on frame
    // so we should find two the biggest
    // returns position of start and end and diameter of found point
    // returns empty array [] if there is no two points
    find_position_of_end_points(points_mask) {
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();

        cv.findContours(points_mask, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        hierarchy.delete();

        let positions = [];
        // get two biggest 2
        if (contours.size() >= 2) {
            let largestRadius1 = 0;
            let largestRadius2 = 0;

            for (let i = 0; i < contours.size(); i++) {
                let areaValue = cv.contourArea(contours.get(i), false);

                if (areaValue > largestRadius1) {
                    largestRadius2 = largestRadius1;
                    largestRadius1 = areaValue;

                    let rect = cv.boundingRect(contours.get(i));

                    positions[1] = positions[0];
                    positions[0] = {
                        x: Math.round((rect.x + rect.width / 2)),
                        y: Math.round((rect.y + rect.height / 2)),
                        radius: Math.round(Math.max(rect.height, rect.width) / 2),
                    };

                } else if (areaValue > largestRadius2) {
                    largestRadius2 = areaValue;

                    let rect = cv.boundingRect(contours.get(i));

                    positions[1] = {
                        x: Math.round((rect.x + rect.width / 2)),
                        y: Math.round((rect.y + rect.height / 2)),
                        radius: Math.round(Math.max(rect.height, rect.width) / 2),
                    };
                }
            }
        }

        contours.delete();
        return positions;
    }

    calculateMaze() {

        try {
            // get gray frame
            let gray = new cv.Mat();
            cv.cvtColor(this.frame_from_video, gray, cv.COLOR_RGBA2GRAY, 0);
            // threshold image to emilinate white colors - we get only black labirynth + green points
            cv.threshold(gray, gray, this.sensivity_of_geeting_labirynth, 255, cv.THRESH_BINARY_INV);

            // dilatation for bolder walls of maze
            dilateImage(gray, this.labirynth_mask, 3);
            // cv.dilate(
            //     gray,
            //     this.labirynth_mask,
            //     cv.Mat.ones(3, 3, cv.CV_8U), //kernel
            //     new cv.Point(-1, -1), //anchor (-1 is default for center)
            //     1, // iteration of dilatation //TODO this could be too much - change also in green points in case of
            //     cv.BORDER_CONSTANT,
            //     cv.morphologyDefaultBorderValue()
            // );

            // we need to get green points mask for differentiation of labirynth mask
            let hsv = new cv.Mat();
            cv.cvtColor(this.frame_from_video, hsv, cv.COLOR_BGR2HSV, 0);
            const low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), this.lower_green);
            const high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), this.upper_green);

            let points_mask = new cv.Mat();
            cv.inRange(hsv, low, high, points_mask);
            dilateImage(points_mask, points_mask, 5);
            
            // cv.dilate(
            //     points_mask,
            //     points_mask,
            //     cv.Mat.ones(5, 5, cv.CV_8U),
            //     new cv.Point(-1, -1),
            //     1,
            //     cv.BORDER_CONSTANT,
            //     cv.morphologyDefaultBorderValue()
            // );


// VIOLET TEST

// we need to get green points mask for differentiation of labirynth mask
let hsv2 = new cv.Mat();
cv.cvtColor(this.frame_from_video, hsv2, cv.COLOR_BGR2HSV, 0);
const low2 = new cv.Mat(hsv2.rows, hsv2.cols, hsv2.type(), this.lower_violet);
const high2 = new cv.Mat(hsv2.rows, hsv2.cols, hsv2.type(), this.upper_violet);

// let points_mask2 = new cv.Mat();
cv.inRange(hsv2, low2, high2, this.user_path);
dilateImage(this.user_path, this.user_path, 5);
// cv.dilate(
//     this.user_path,
//     this.user_path,
//     cv.Mat.ones(5, 5, cv.CV_8U),
//     new cv.Point(-1, -1),
//     1,
//     cv.BORDER_CONSTANT,
//     cv.morphologyDefaultBorderValue()
// );

// user_path

// VIOLET TEST


            let mask = new cv.Mat();
            cv.subtract(this.labirynth_mask, points_mask, this.labirynth_mask, mask, -1);

            let points = this.find_position_of_end_points(points_mask);

            this.circles = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);
            this.solved_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

            if (points.length > 0) {
                this.is_green_points = true;

               //console.log("green points!");

                cv.circle(this.circles, new cv.Point(points[0].x, points[0].y), points[0].radius * 2, this.green, -1);
                cv.circle(this.circles, new cv.Point(points[1].x, points[1].y), points[1].radius * 2, this.green, -1);

                let solver_result = Solver.solve(this.labirynth_mask, points[0], points[1]);


                if (solver_result.is_solved) {
                    //console.log("solved!");
                    if (this.labirynth_mask.isContinuous()) {

                        for (const point of solver_result.path) {
                            let ch = this.solved_path_mask.channels();
                            let ptr = point.y * this.solved_path_mask.cols * ch + point.x * ch;
                            this.solved_path_mask.data[ptr] = this.path_color[0]; // R
                            this.solved_path_mask.data[ptr + 1] = this.path_color[1]; // G
                            this.solved_path_mask.data[ptr + 2] = this.path_color[2]; // B
                            this.solved_path_mask.data[ptr + 3] = this.path_color[3]; // A
                        }

                        dilateImage(this.solved_path_mask, this.solved_path_mask, 4);

                        // cv.dilate(
                        //     this.solved_path_mask,
                        //     this.solved_path_mask,
                        //     cv.Mat.ones(4, 4, cv.CV_8U),
                        //     new cv.Point(-1, -1),
                        //     1,
                        //     cv.BORDER_CONSTANT,
                        //     cv.morphologyDefaultBorderValue()
                        // );

                        // this.solved_path_mask = temp_solved_path_mask.clone();
                        // temp_solved_path_mask.delete();
                    }
                }
            }

            else {
                this.is_green_points = false;
            }

            gray.delete();
            mask.delete();
            low.delete();
            high.delete();
            hsv.delete();
            points_mask.delete();

            // VIOLET
            hsv2.delete();
            // points_mask2.delete();
            // VIOLET

        } catch (error) {
            console.log(error);
            printError(error);
        }
    }

    start() {
        const cap = new cv.VideoCapture(this.video);

        const mazing = () => {
            try {
                let begin = Date.now();

                cap.read(this.frame_from_video);

                this.calculateMaze();
                this.context_green_points.clearRect(0, 0, this.video.offsetHeight, this.video.offsetWidth);
                cv.imshow('canvas_output_green_points', this.circles);
                // this.context_solved_path.clearRect(0, 0, this.video.offsetHeight, this.video.offsetWidth);
                // cv.imshow('canvas_output_solved_path', this.solved_path_mask);

                // VIOLET
                this.context_user_path.clearRect(0, 0, this.video.offsetHeight, this.video.offsetWidth);
                cv.imshow('canvas_output_user_path', this.user_path);
                // VIOLET

                let delay = 1000 / this.FPS - (Date.now() - begin);
                setTimeout(() => mazing(), delay);

            } catch (err) {
                console.log(err);
                printError(err);
            }
        };

        // schedule the first one.
        setTimeout(() => mazing(), 0); // TODO simply mazing() ?
    }

    //todo
    // free(){
    //     clearInterval(refreshIntervalId);
    //     clearInterval(refreshIntervalId);
    // src.delete(); dst.delete(); //TODO delete also class Mat
    // }


}
