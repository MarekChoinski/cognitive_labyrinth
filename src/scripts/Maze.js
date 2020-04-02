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
        this.context = document.getElementById("canvas_output").getContext("2d");
        this.context_labirynth = document.getElementById("canvas_output_labirynth").getContext("2d");
        this.context_green_points = document.getElementById("canvas_output_green_points").getContext("2d");
        this.frame_from_video = cv.Mat.zeros(this.video.height, this.video.width, cv.CV_8UC4);

        // this.frame_from_video = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        // this.frame_from_video = cv.imread('canvas_input');
        this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.labirynth_mask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        this.solver_result = {
            is_solved: false,
        };
        // this.circles = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        this.circles = cv.Mat.zeros(this.video.height, this.video.width, cv.CV_8UC4);
        // this.solved_path_mask = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        this.solved_path_mask = cv.Mat.zeros(this.video.height, this.video.width, cv.CV_8UC4);
        this.cap = new cv.VideoCapture(video);

        this.FPS = 24;
        this.sensivity_of_geeting_labirynth = 110;

        // this.lower_green = [40, 100, 85, 0];
        // this.upper_green = [75, 255, 255, 255];
        this.lower_green = [30, 80, 75, 0];
        this.upper_green = [85, 255, 255, 255];

        this.green = [0, 255, 0, 128];

        this.is_green_points = false;
        this.points = [];
        this.path = [];
        this.is_solved = false;
    }

    showVideo() {
        try {

            this.context.clearRect(0, 0, this.video.height, this.video.width);

            // get camera_frame
            let actual_frame = new cv.Mat.zeros(this.video.height, this.video.width, cv.CV_8UC4);
            this.cap.read(this.frame_from_video);

            actual_frame = this.frame_from_video.clone();
            // actual_frame.delete();




            // let addWeightedMat = cv.Mat.zeros(this.frame_from_video.rows, this.frame_from_video.cols, this.frame_from_video.type());
            // let addWeightedMat2 = cv.Mat.zeros(this.frame_from_video.rows, this.frame_from_video.cols, this.frame_from_video.type());

            // if (this.is_solved) {
            //     console.log("powinien byc labirynt");
            //     // console.log(this.is_solved);

            //     // cv.addWeighted(actual_frame, 1, this.circles, 0.5, 1, actual_frame);
            //     cv.addWeighted(this.frame_from_video, 1, this.circles, 0.2, 1, addWeightedMat);
            //     cv.addWeighted(addWeightedMat, 1, this.solved_path_mask, 0.5, 1, addWeightedMat2);
            //     //     cv.imshow('canvas_output', addWeightedMat2);
            //     cv.imshow('canvas_output', addWeightedMat2);
            // }

            // else 
            // console.log(this.points);

            if (this.points.length > 0) {
                cv.circle(actual_frame, new cv.Point(this.points[0].x, this.points[0].y), this.points[0].radius, this.green, -1);
                cv.circle(actual_frame, new cv.Point(this.points[1].x, this.points[1].y), this.points[1].radius, this.green, -1);
            }

            if (this.is_solved) {
                console.log("solved");

                if (this.labirynth_mask.isContinuous()) {
                    for (const point of this.path) {
                        let ch = actual_frame.channels();
                        let ptr = point.y * actual_frame.cols * ch + point.x * ch;
                        actual_frame.data[ptr] = 255; // R
                        actual_frame.data[ptr + 1] = 255; // G
                        actual_frame.data[ptr + 2] = 255; // B
                        actual_frame.data[ptr + 3] = 15; // A
                    }
                }

                // cv.dilate(
                //     temp_solved_path_mask,
                //     temp_solved_path_mask,
                //     cv.Mat.ones(5, 5, cv.CV_8U),
                //     new cv.Point(-1, -1),
                //     1,
                //     cv.BORDER_CONSTANT,
                //     cv.morphologyDefaultBorderValue()
                // );
            }

            // if (this.is_green_points) {
            //     console.log(this.is_solved, this.is_green_points);
            //     cv.addWeighted(this.frame_from_video, 1, this.circles, 0.2, 1, addWeightedMat);
            //     //     cv.addWeighted(actual_frame, 1, this.solved_path_mask, 1, 1, addWeightedMat);
            //     cv.imshow('canvas_output', addWeightedMat);
            // }

            // else {
            cv.imshow('canvas_output', actual_frame);
            // }
            actual_frame.delete();
            // cv.imshow('canvas_output', this.labirynth_mask);

            // actual_frame.delete();
            // addWeightedMat.delete();
            // addWeightedMat2.delete();
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
            // let actual_labirynth_mask = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC1);
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
                cv.Mat.ones(3, 3, cv.CV_8U),
                new cv.Point(-1, -1),
                1,
                cv.BORDER_CONSTANT,
                cv.morphologyDefaultBorderValue()
            );

            let mask = new cv.Mat();
            cv.subtract(this.labirynth_mask, points_mask, this.labirynth_mask, mask, -1);



            let points = this.find_position_of_end_points(points_mask);

            this.is_solved = false;


            this.circles = cv.Mat.zeros(this.video.height, this.video.width, cv.CV_8UC4);
            if (points.length > 0) {
                this.is_green_points = true;

                console.log("green points!");



                cv.circle(this.circles, new cv.Point(points[0].x, points[0].y), points[0].radius * 2, this.green, -1);
                cv.circle(this.circles, new cv.Point(points[1].x, points[1].y), points[1].radius * 2, this.green, -1);

                // this.circles = temp_circles.clone();
                // temp_circles.delete();

                let solver_result = Solver.solve(this.labirynth_mask, points[0], points[1]);
                // this.labirynth_mask = actual_labirynth_mask;
                //this.points = [...points];
                //this.is_solved = solver_result.is_solved;
                //this.path = [...solver_result.path];

                if (solver_result.is_solved) //{
                    console.log("solved!");
                // if (this.labirynth_mask.isContinuous()) {

                // let temp_solved_path_mask = cv.Mat.zeros(this.video.height, this.video.width, cv.CV_8UC4);

                // for (const point of solver_result.path) {
                //     let ch = temp_solved_path_mask.channels();
                //     let ptr = point.y * temp_solved_path_mask.cols * ch + point.x * ch;
                //     temp_solved_path_mask.data[ptr] = 255; // R
                //     temp_solved_path_mask.data[ptr + 1] = 255; // G
                //     temp_solved_path_mask.data[ptr + 2] = 255; // B
                //     temp_solved_path_mask.data[ptr + 3] = 15; // A
                // }

                // cv.dilate(
                //     temp_solved_path_mask,
                //     temp_solved_path_mask,
                //     cv.Mat.ones(5, 5, cv.CV_8U),
                //     new cv.Point(-1, -1),
                //     1,
                //     cv.BORDER_CONSTANT,
                //     cv.morphologyDefaultBorderValue()
                // );

                // this.solved_path_mask = temp_solved_path_mask.clone();
                // temp_solved_path_mask.delete();
                // }
                // }
            }

            else {
                this.is_green_points = false;
            }


            // console.log(points[0], points[1]);





            // this.is_solved = solver_result.is_solved;



            gray.delete();
            mask.delete();
            low.delete();
            high.delete();
            hsv.delete();
            points_mask.delete();
            // actual_labirynth_mask.delete();
        } catch (error) {
            console.log(error);
            printError(error);
        }
    }

    start() {
        //let video = this.video;
        let cap = new cv.VideoCapture(this.video);

        // take first frame of the video
        //let frame = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
        //cap.read(frame);



        const processVideo = () => {
            try {
                let begin = Date.now();

                cap.read(this.frame_from_video);

                let actual_frame = this.frame_from_video.clone();

                cv.cvtColor(actual_frame, actual_frame, cv.COLOR_RGBA2RGB);

                // let hsv = new cv.Mat();
                // cv.cvtColor(actual_frame, hsv, cv.COLOR_RGB2HSV, 0);


                // let labirynth_mask_C3 = new cv.Mat();
                // cv.cvtColor(this.labirynth_mask, labirynth_mask_C3, cv.COLOR_GRAY2RGB, 0);
                // labirynth_mask_C3.convertTo(this.labirynth_mask, cv.CV_8UC3);

                //console.log(hsv.channels(), actual_frame.channels());
                // console.log(this.labirynth_mask.channels(), actual_frame.channels());
                // console.log('a', labirynth_mask_C3.type(), actual_frame.type());
                // console.log('a', labirynth_mask_C3.channels(), actual_frame.channels());

                // cv.addWeighted(actual_frame, 1, hsv, 0.5, 1, actual_frame);
                // cv.addWeighted(actual_frame, 1, labirynth_mask_C3, 0.5, 1, actual_frame);
                // console.log('b', labirynth_mask_C3.channels(), actual_frame.channels());




                // if (this.points.length > 0) {
                //     cv.circle(actual_frame, new cv.Point(this.points[0].x, this.points[0].y), this.points[0].radius, this.green, -1);
                //     cv.circle(actual_frame, new cv.Point(this.points[1].x, this.points[1].y), this.points[1].radius, this.green, -1);
                // }

                // if (this.is_solved) {
                //     console.log("solved");

                //     // if (this.labirynth_mask.isContinuous()) {
                //     if (actual_frame.isContinuous()) {
                //         for (const point of this.path) {
                //             let ch = actual_frame.channels();
                //             let ptr = point.y * actual_frame.cols * ch + point.x * ch;
                //             actual_frame.data[ptr] = 255; // R
                //             actual_frame.data[ptr + 1] = 255; // G
                //             actual_frame.data[ptr + 2] = 255; // B
                //             actual_frame.data[ptr + 3] = 15; // A
                //         }
                //     }

                //     // cv.dilate(
                //     //     temp_solved_path_mask,
                //     //     temp_solved_path_mask,
                //     //     cv.Mat.ones(5, 5, cv.CV_8U),
                //     //     new cv.Point(-1, -1),
                //     //     1,
                //     //     cv.BORDER_CONSTANT,
                //     //     cv.morphologyDefaultBorderValue()
                //     // );
                // }


                this.context.clearRect(0, 0, this.video.height, this.video.width);
                cv.imshow('canvas_output', actual_frame);
                // this.context_labirynth.clearRect(0, 0, this.video.height, this.video.width);
                // cv.imshow('canvas_output_labirynth', this.labirynth_mask);
                this.context_green_points.clearRect(0, 0, this.video.height, this.video.width);
                cv.imshow('canvas_output_green_points', this.circles);

                // hsv.delete();
                actual_frame.delete();
                // labirynth_mask_C3.delete();

                // schedule the next one.
                let delay = 1000 / this.FPS - (Date.now() - begin);
                setTimeout(() => processVideo(), delay);
            } catch (err) {
                console.log(err);

                printError(err);
            }
        };

        // schedule the first one.
        setTimeout(() => processVideo(), 0); // TODO simply processVideo() ?



        const FPS_MAZE = 5;
        const mazing = () => {
            try {
                let begin = Date.now();
                this.calculateMaze();


                // console.log("test");

                // setTimeout(() => mazing(), 0);

                let delay = 1000 / FPS_MAZE - (Date.now() - begin);
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
