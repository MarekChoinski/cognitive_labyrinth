// TODO should be symbols: when refactoring image to labirynth it should check eg. if it is 255 and then declare this as Symbol("255")
const Direction = Object.freeze({
    WALL: 255,
    WAY: 0,

    START: 1,
    END: 2,

    UP: 3,
    DOWN: 4,
    LEFT: 5,
    RIGHT: 6,

    UP_FOUND: 7,
    DOWN_FOUND: 8,
    LEFT_FOUND: 9,
    RIGHT_FOUND: 10,
});

export default class Solver {

    static solve(labirynth_mask, start, end) {
        console.time('Całość');
        cv.copyMakeBorder(labirynth_mask, labirynth_mask, 1, 1, 1, 1, cv.BORDER_CONSTANT, [255, 255, 255, 255]);

        console.time('Wypełnienie tablicy');

        let labirynth = Array(labirynth_mask.cols).fill().map(() => Array(labirynth_mask.rows).fill());

        for (let i = 0; i < labirynth_mask.cols; i++) {
            for (let j = 0; j < labirynth_mask.rows; j++) {
                labirynth[i][j] = labirynth_mask.ucharAt(i, j);
            }
        }

        console.timeEnd("Wypełnienie tablicy");

        let path = [];

        path.push(start);
        path.push(end);

        labirynth[start.y][start.x] = Direction.START;

        let queue = [];

        queue.push(start);

        let find = false;

        console.time('DST');

        while (queue.length !== 0) {
            let index = queue.shift(); //popleft

            if (index.x === end.x && index.y === end.y) {
                find = true;
                break;
            }

            try {

                // console.log(index.x, index.y);


                // up
                if (labirynth[index.y][index.x - 1] == Direction.WAY) {
                    labirynth[index.y][index.x - 1] = Direction.RIGHT;
                    queue.push({
                        y: index.y,
                        x: index.x - 1,
                    });
                }

                // down
                if (labirynth[index.y][index.x + 1] == Direction.WAY) {
                    labirynth[index.y][index.x + 1] = Direction.LEFT;
                    queue.push({
                        y: index.y,
                        x: index.x + 1,
                    });
                }

                // left
                if (labirynth[index.y - 1][index.x] == Direction.WAY) {
                    labirynth[index.y - 1][index.x] = Direction.DOWN;
                    queue.push({
                        y: index.y - 1,
                        x: index.x,
                    });
                }

                // right
                if (labirynth[index.y + 1][index.x] == Direction.WAY) {
                    labirynth[index.y + 1][index.x] = Direction.UP;
                    queue.push({
                        y: index.y + 1,
                        x: index.x,
                    });
                }

            } catch (error) {
                // return path;
                console.log(error);
            }
        }
        console.timeEnd("DST");


        let shortest_index = end;
        // console.log(labirynth[start.y][start.x] == Direction.START);

        try {

            while (labirynth[shortest_index.y][shortest_index.x] != Direction.START) {

                if (labirynth[shortest_index.y][shortest_index.x] == Direction.UP) {
                    path.push(shortest_index);
                    labirynth[shortest_index.y][shortest_index.x] = Direction.UP_FOUND;
                    shortest_index = {
                        x: shortest_index.x,
                        y: shortest_index.y - 1,
                    };
                }

                if (labirynth[shortest_index.y][shortest_index.x] == Direction.DOWN) {
                    path.push(shortest_index);
                    labirynth[shortest_index.y][shortest_index.x] = Direction.DOWN_FOUND;
                    shortest_index = {
                        x: shortest_index.x,
                        y: shortest_index.y + 1,
                    };
                }

                if (labirynth[shortest_index.y][shortest_index.x] == Direction.LEFT) {
                    path.push(shortest_index);
                    labirynth[shortest_index.y][shortest_index.x] = Direction.LEFT_FOUND;
                    shortest_index = {
                        x: shortest_index.x - 1,
                        y: shortest_index.y,
                    };
                }

                if (labirynth[shortest_index.y][shortest_index.x] == Direction.RIGHT) {
                    path.push(shortest_index);
                    labirynth[shortest_index.y][shortest_index.x] = Direction.RIGHT_FOUND;
                    shortest_index = {
                        x: shortest_index.x + 1,
                        y: shortest_index.y,
                    };
                }
            }

        } catch (error) {
            console.log(error);
        }

        console.timeEnd("Całość");

        return {
            is_solved: find,
            path: path,
        };
    }
}