import Solver from "./Solver";
import {
    dilateImage,
    printError
} from './utils';


//TODO: dilatate should be function 
export default class Maze {

    constructor(video) {

        this.video = video;
        // this.context = document.getElementById("canvas_output").getContext("2d");
        this.context_labirynth = document.getElementById("canvas_output_labirynth").getContext("2d");
        this.context_green_points = document.getElementById("canvas_output_green_points").getContext("2d");
        this.context_solved_path = document.getElementById("canvas_output_solved_path").getContext("2d");
        this.context_user_path = document.getElementById("canvas_output_user_path").getContext("2d");
        this.context_user_path_mask = document.getElementById("canvas_output_user_path").getContext("2d");

        this.frame_from_video = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.labirynth_mask = new cv.Mat(video.offsetHeight, video.offsetWidth, cv.CV_8UC1);

        this.circles = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);
        this.solved_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.user_path = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);
        this.common_with_green_user_path = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC1);
        this.solved_user_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.user_path_length = 0;
        this.optimal_path_length = 0;

        this.FPS = 1;
        this.sensivity_of_geeting_labirynth = 110;

        // ITS OPENV_HSV
        // explanation: https://stackoverflow.com/questions/17878254/opencv-python-cant-detect-blue-objects
        this.lower_green = [30, 80, 75, 0];
        this.upper_green = [85, 255, 255, 255];

        this.lower_violet = [115, 50, 80, 0];
        this.upper_violet = [180, 255, 255, 255];

        // RGB
        this.green = [0, 255, 0, 128];
        this.path_color = [214, 6, 214, 255];
        this.user_path_color = [255, 0, 0, 255];
    }

    // we should find position of end points
    // there could be a lot of green elements on frame
    // so we should find two the biggest
    // returns position of start and end and diameter of found point
    // returns empty array [] if there is no two points
    // also used in finding common point of circles and user path
    find_position_of_end_points(points_mask) {
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();

        cv.findContours(points_mask, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        hierarchy.delete();

        let positions = [];
        // get two biggest 2
        // console.log(contours);
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

            // we need to get green points mask for differentiation of labirynth mask
            let hsv = new cv.Mat();
            cv.cvtColor(this.frame_from_video, hsv, cv.COLOR_BGR2HSV, 0);
            const low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), this.lower_green);
            const high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), this.upper_green);

            let points_mask = new cv.Mat();
            cv.inRange(hsv, low, high, points_mask);
            //points_mask is all green elements from fram
            dilateImage(points_mask, points_mask, 5);

            // we need to delete green
            let no_array = new cv.Mat(); // dummy mask for subtraction
            cv.subtract(this.labirynth_mask, points_mask, this.labirynth_mask, no_array, -1);

            let points = this.find_position_of_end_points(points_mask);

            // reset circles and solved_path_mask
            this.circles = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);
            this.solved_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

            if (points.length > 0) { // >= 2 ?
                cv.circle(this.circles, new cv.Point(points[0].x, points[0].y), points[0].radius * 2, this.green, -1);
                cv.circle(this.circles, new cv.Point(points[1].x, points[1].y), points[1].radius * 2, this.green, -1);

                let solver_result = Solver.solve(this.labirynth_mask, points[0], points[1]);
                
                if(solver_result.path.length > 100){
                    this.optimal_path_length = solver_result.path.length;
                }

                if (solver_result.is_solved) {
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
                    }
                }
            }

            // VIOLET TEST

            // get user_path - range violet color
            let hsv2 = new cv.Mat();
            cv.cvtColor(this.frame_from_video, hsv2, cv.COLOR_BGR2HSV, 0);
            const low2 = new cv.Mat(hsv2.rows, hsv2.cols, hsv2.type(), this.lower_violet);
            const high2 = new cv.Mat(hsv2.rows, hsv2.cols, hsv2.type(), this.upper_violet);
            cv.inRange(hsv2, low2, high2, this.user_path);
            dilateImage(this.user_path, this.user_path, 5);

            // we need to get logical or of user_path and green circles to find out if labirynth is solved by user
            let gray_circles = new cv.Mat();
            cv.cvtColor(this.circles, gray_circles, cv.COLOR_RGBA2GRAY, 0);
            cv.bitwise_and(this.user_path, gray_circles, this.common_with_green_user_path);

            // find start and end of user solve
            let points_user = this.find_position_of_end_points(this.common_with_green_user_path);
            this.solved_user_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

            // console.log("points_user", points_user);

            points_user.filter((el)=>el != null);
            cv.bitwise_not(this.user_path, this.user_path, no_array);
            // find shortest path beetwen two points of user solve
            // we need to count path to compare this to app solve
            if (points_user.length >= 2) {
                let solver_result = Solver.solve(this.user_path, points_user[0], points_user[1]);

                if(solver_result.path.length > 100){
                    this.user_path_length = solver_result.path.length;
                }

                if (solver_result.is_solved) {
                    if (this.user_path.isContinuous()) {

                        for (const point of solver_result.path) {
                            let ch = this.solved_user_path_mask.channels();
                            let ptr = point.y * this.solved_user_path_mask.cols * ch + point.x * ch;
                            this.solved_user_path_mask.data[ptr] = this.user_path_color[0]; // R
                            this.solved_user_path_mask.data[ptr + 1] = this.user_path_color[1]; // G
                            this.solved_user_path_mask.data[ptr + 2] = this.user_path_color[2]; // B
                            this.solved_user_path_mask.data[ptr + 3] = this.user_path_color[3]; // A
                        }
                        dilateImage(this.solved_user_path_mask, this.solved_user_path_mask, 4);
                    }
                }
            }

            // user_path

            // VIOLET TEST
            gray.delete();
            no_array.delete();
            low.delete();
            high.delete();
            hsv.delete();
            points_mask.delete();

            // VIOLET
            hsv2.delete();
            gray_circles.delete();
            low2.delete();
            high2.delete();
            // points_mask2.delete();
            // VIOLET

        } catch (error) {
            console.log(err);
                let a = printError(err);
                console.log(a);
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
                this.context_solved_path.clearRect(0, 0, this.video.offsetHeight, this.video.offsetWidth);
                cv.imshow('canvas_output_solved_path', this.solved_path_mask);

                // VIOLET
                this.context_user_path.clearRect(0, 0, this.video.offsetHeight, this.video.offsetWidth);
                cv.imshow('canvas_output_user_path', this.solved_user_path_mask);//this.common_with_green_user_path);
                // this.context_user_path_mask.clearRect(0, 0, this.video.offsetHeight, this.video.offsetWidth);
                // cv.imshow('canvas_output_solved_path_mask', this.user_path);//this.common_with_green_user_path);
                // VIOLET
                console.log(this.user_path_length, this.optimal_path_length, Math.round((this.optimal_path_length/this.user_path_length) * 100) / 100);

                // console.log("chuj");

                let delay = 1000 / this.FPS - (Date.now() - begin);
                setTimeout(() => mazing(), delay);

            } catch (err) {
                console.log(err);
                let a = printError(err);
                console.log(a);
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