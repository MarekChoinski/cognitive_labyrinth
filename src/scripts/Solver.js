const Direction = Object.freeze({
    WALL: Symbol(255),
    WAY: Symbol(0),

    START: Symbol("START"),
    END: Symbol("END"),

    UP: Symbol("UP"),
    DOWN: Symbol("DOWN"),
    LEFT: Symbol("LEFT"),
    RIGHT: Symbol("RIGHT"),

    UP_FOUND: Symbol("UP_FOUND"),
    DOWN_FOUND: Symbol("DOWN_FOUND"),
    LEFT_FOUND: Symbol("LEFT_FOUND"),
    RIGHT_FOUND: Symbol("RIGHT_FOUND"),
});

export default class Solver {

    static solve(labirynth_mask, start, end) {

        cv.copyMakeBorder(labirynth_mask, labirynth_mask, 1, 1, 1, 1, cv.BORDER_CONSTANT, [255, 255, 255, 255]);

        let path = [];

        console.time('Wypełnienie tablicy');
        // console.timeLog("MyTimer", "Starting application up…");

        let labirynth = Array(labirynth_mask.cols).fill().map(() => Array(labirynth_mask.rows).fill());

        for (let i = 0; i < labirynth_mask.cols; i++) {
            for (let j = 0; j < labirynth_mask.rows; j++) {
                labirynth[i][j] = labirynth_mask.ucharAt(i, j);
            }
        }

        console.timeEnd("Wypełnienie tablicy");

        // let a = new cv.Mat();
        // a.getDa

        // TODO there should be padding with 1px black border to avoid index error
        //labirynth = np.pad(labirynth, pad_width=0, mode='constant', constant_values=255)



        return labirynth;
    }
}