import Solver from "./Solver";

export default class Maze {


    constructor(video) {



        this.video = video;
        this.frame_from_video = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        // this.frame_from_video = cv.imread('canvas_input');
        this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.labirynth_mask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.circles = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        this.solved_path_mask = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        //this.cap = new cv.VideoCapture(video);

        this.FPS = 24;
        this.sensivity_of_geeting_labirynth = 110;

        // this.circles = cv.Mat.zeros(video.height, video.width, cv.CV_8UC3);

        this.lower_green = [40, 100, 85, 0];
        this.upper_green = [75, 255, 255, 255];

        this.green = [0, 255, 0, 255];

        this.is_green_points = false;
        // points = [];
    }

    showVideo() {
        try {

            // get camera_frame
            // this.cap.read(this.frame_from_video);

            const addWeightedMat = new cv.Mat(this.frame_from_video.rows, this.frame_from_video.cols, this.frame_from_video.type());
            // const addWeightedMat2 = new cv.Mat(this.frame_from_video.rows, this.frame_from_video.cols, this.frame_from_video.type());
            if (this.is_green_points) {
                // cv.addWeighted(this.frame_from_video, 1, this.circles, 0.3, 1, addWeightedMat);
                cv.addWeighted(this.frame_from_video, 1, this.solved_path_mask, 0.7, 1, addWeightedMat);
                // cv.addWeighted(addWeightedMat, 1, this.labirynth_mask, 0.3, 1, addWeightedMat2);
            }

            // cv.imshow('canvas_output', this.frame_from_video);
            cv.imshow('canvas_output', addWeightedMat);
            // cv.imshow('canvas_output', this.labirynth_mask);

            addWeightedMat.delete();
        } catch (err) {
            console.log(err);
        }
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
            // get grame frame
            let gray = new cv.Mat();

            cv.cvtColor(this.frame_from_video, gray, cv.COLOR_RGBA2GRAY, 0);
            // threshold image to emilinate white colors - we get only black labirynth + green points
            cv.threshold(gray, gray, this.sensivity_of_geeting_labirynth, 255, cv.THRESH_BINARY_INV);

            // dilatation for bolder walls of maze
            cv.dilate(
                gray,
                this.labirynth_mask,
                cv.Mat.ones(5, 5, cv.CV_8U), //kernel
                new cv.Point(-1, -1), //anchor (-1 is default for center)
                4, // iteration of dilatation //TODO this could be too much - change also in green points in case of
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
                4,
                cv.BORDER_CONSTANT,
                cv.morphologyDefaultBorderValue()
            );

            let mask = new cv.Mat();
            cv.subtract(this.labirynth_mask, points_mask, this.labirynth_mask, mask, -1);

            let points = this.find_position_of_end_points(points_mask);

            if (points.length > 0) {
                this.is_green_points = true;
                // this.circles;
                cv.circle(this.circles, new cv.Point(points[0].x, points[0].y), points[0].radius, this.green, -1);
                cv.circle(this.circles, new cv.Point(points[1].x, points[1].y), points[1].radius, this.green, -1);
            }

            else {
                this.is_green_points = false;
            }

            const solver_result = Solver.solve(this.labirynth_mask, points[0], points[1]);

            if (solver_result.is_solved) {
                if (this.labirynth_mask.isContinuous()) {

                    let temp_solved_path_mask = cv.Mat.zeros(this.video.height, this.video.width, cv.CV_8UC4);

                    for (const point of solver_result.path) {
                        let ch = temp_solved_path_mask.channels();
                        let ptr = point.y * temp_solved_path_mask.cols * ch + point.x * ch;
                        temp_solved_path_mask.data[ptr] = 255; // R
                        temp_solved_path_mask.data[ptr + 1] = 255; // G
                        temp_solved_path_mask.data[ptr + 2] = 255; // B
                        temp_solved_path_mask.data[ptr + 3] = 15; // A
                    }

                    cv.dilate(
                        temp_solved_path_mask,
                        temp_solved_path_mask,
                        cv.Mat.ones(5, 5, cv.CV_8U),
                        new cv.Point(-1, -1),
                        1,
                        cv.BORDER_CONSTANT,
                        cv.morphologyDefaultBorderValue()
                    );

                    this.solved_path_mask = temp_solved_path_mask.clone();
                    temp_solved_path_mask.delete();
                }
            }

            gray.delete();
            mask.delete();
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

        setInterval(() => this.calculateMaze(), 1000); //TODO: probably shouldn't be faster than FPS, but idk tbh // TODO2: or make some guard variable to check if there is new frame - eg. is_new_frame = false
    }

    //todo
    // free(){
    //     clearInterval(refreshIntervalId);
    //     clearInterval(refreshIntervalId);
    // src.delete(); dst.delete(); //TODO delete also class Mat
    // }


}
