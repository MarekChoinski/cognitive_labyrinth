<div align="center">
  <h1>Maze solver</h1>

Maze solver is **Progressive Web App** with real-time camera solves handwritten labyrinths using **Opencv.js**, **WebRTC** and breadth-first search of graph. Written carefully using **OOP** and tested with **Jest**.

[![Dependabot badge](https://flat.badgen.net/dependabot/wbkd/webpack-starter?icon=dependabot)](https://dependabot.com/)

<img src="https://i.imgur.com/r0qh4tT.jpg" width="500" align="center">

</div>
<div align="center">
  <h1>How it works?</h1>

</div>

1. Using WebRTC image from camera is captured from online webcam (eg. from smartphone)
2. Image is grayscaled
3. Appropriate gray levels is picked up for extracing maze
4. Maze mask is dilatated for better effect
5. Using again captured image green color is tresholded
6. Two biggest green area are selected as end points of labirynth
7. Maze mask and green mask is transformed to matrix of ints
8. Matrix(graph) is solved using breadth-first search
9. Solved path is drawn on canvas

And this is repeated on 24 FPS.


<div align="center">
  <h1>Developing</h1>
</div>

### Installation

```
npm install
```

### Start Dev Server

```
npm start
```

### Run tests

```
npm test
```

### Build Prod Version

```
npm run build
```

</div>
