export const printError = (err) => {
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

export const dilateImage = (
    src,
    dst,
    size
) => {
    cv.dilate(
        src,
        dst,
        cv.Mat.ones(size, size, cv.CV_8U), //kernel
        new cv.Point(-1, -1), //anchor (-1 is default for center)
        1, // iteration of dilatation //TODO this could be too much - change also in green points in case of
        cv.BORDER_CONSTANT,
        cv.morphologyDefaultBorderValue()
    );
};