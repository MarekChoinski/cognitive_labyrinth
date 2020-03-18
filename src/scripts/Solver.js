const Direction = Object.freeze({
    WALL: Symbol("WALL"),
    WAY: Symbol("WAY"),

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

    static solve(labirynth, start, end) {

        let path = [];
        // console.log(Direction.WALL);
        // console.log(start);
        // console.log();

        return "xD";
    }
}