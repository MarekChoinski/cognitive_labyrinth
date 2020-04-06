import Solver from "./Solver";


const printError = (err) => {
    if (typeof err === 'undefined') {
        err = '';
    } else if (typeof err === 'number') {
        if (!isNaN(err)) {
            if (typeof cv !== 'undefined') {
                err = 'Exception: ' + cv.exceptionFromPtr(err).msg;
            }
        }
    } else if (typeof err === 'string') {
        let ptr = Number(err.split(' ')[0]);
        if (!isNaN(ptr)) {
            if (typeof cv !== 'undefined') {
                err = 'Exception: ' + cv.exceptionFromPtr(ptr).msg;
            }
        }
    } else if (err instanceof Error) {
        err = err.stack.replace(/\n/g, '<br>');
    }

    throw new Error(err);
};


//TODO: dilatate should be function 
export default class Maze {

    constructor(video) {

        this.video = video;
        // this.context = document.getElementById("canvas_output").getContext("2d");
        this.context_labirynth = document.getElementById("canvas_output_labirynth").getContext("2d");
        this.context_green_points = document.getElementById("canvas_output_green_points").getContext("2d");
        this.context_solved_path = document.getElementById("canvas_output_solved_path").getContext("2d");
        this.frame_from_video = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.labirynth_mask = new cv.Mat(video.offsetHeight, video.offsetWidth, cv.CV_8UC1);

        this.circles = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);
        this.solved_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

        this.FPS = 1;
        this.sensivity_of_geeting_labirynth = 110;

        // this.lower_green = [40, 100, 85, 0];
        // this.upper_green = [75, 255, 255, 255];
        this.lower_green = [30, 80, 75, 0];
        this.upper_green = [85, 255, 255, 255];

        this.green = [0, 255, 0, 128];
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
                cv.Mat.ones(3, 3, cv.CV_8U), //kernel
                new cv.Point(-1, -1), //anchor (-1 is default for center)
                1, // iteration of dilatation //TODO this could be too much - change also in green points in case of
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
            cv.subtract(this.labirynth_mask, points_mask, this.labirynth_mask, mask, -1);

            let points = this.find_position_of_end_points(points_mask);

            this.circles = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);
            this.solved_path_mask = cv.Mat.zeros(this.video.offsetHeight, this.video.offsetWidth, cv.CV_8UC4);

            if (points.length > 0) {
                this.is_green_points = true;

                console.log("green points!");

                cv.circle(this.circles, new cv.Point(points[0].x, points[0].y), points[0].radius * 2, this.green, -1);
                cv.circle(this.circles, new cv.Point(points[1].x, points[1].y), points[1].radius * 2, this.green, -1);

                let solver_result = Solver.solve(this.labirynth_mask, points[0], points[1]);


                if (solver_result.is_solved) {
                    console.log("solved!");
                    if (this.labirynth_mask.isContinuous()) {

                        for (const point of solver_result.path) {
                            let ch = this.solved_path_mask.channels();
                            let ptr = point.y * this.solved_path_mask.cols * ch + point.x * ch;
                            this.solved_path_mask.data[ptr] = 0; // R
                            this.solved_path_mask.data[ptr + 1] = 0; // G
                            this.solved_path_mask.data[ptr + 2] = 255; // B
                            this.solved_path_mask.data[ptr + 3] = 255; // A
                        }

                        cv.dilate(
                            this.solved_path_mask,
                            this.solved_path_mask,
                            cv.Mat.ones(4, 4, cv.CV_8U),
                            new cv.Point(-1, -1),
                            1,
                            cv.BORDER_CONSTANT,
                            cv.morphologyDefaultBorderValue()
                        );

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
                this.context_solved_path.clearRect(0, 0, this.video.offsetHeight, this.video.offsetWidth);
                cv.imshow('canvas_output_solved_path', this.solved_path_mask);

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
