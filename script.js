// ==========================================
// ESCAPE MODE
// KINETIC STUDIOS
// A* ENEMY PATHFINDING VERSION
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const levelText = document.getElementById("levelText");
const healthText = document.getElementById("healthText");
const keyText = document.getElementById("keyText");
const timeText = document.getElementById("timeText");

const objective = document.getElementById("objective");
const message = document.getElementById("message");

const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");


// ==========================================
// GAME STATE
// ==========================================

let running = false;
let level = 1;

let health = 100;
let hasKey = false;
let timeLeft = 120;

let lastTime = 0;
let timerCounter = 0;

let player;
let enemy;
let exitZone;
let keyItem;

let walls = [];
let decorations = [];


// ==========================================
// PATHFINDING
// ==========================================

const GRID_SIZE = 32;

let path = [];
let pathTimer = 0;


// ==========================================
// INPUT
// ==========================================

const keys = {};

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (
        [
            "w",
            "a",
            "s",
            "d",
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
            "shift",
            " "
        ].includes(e.key.toLowerCase())
    ) {
        e.preventDefault();
    }

});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});


// ==========================================
// BUTTONS
// ==========================================

startButton.addEventListener("click", () => {

    menu.style.display = "none";
    gameScreen.style.display = "block";

    resizeCanvas();

    running = true;

    startLevel(1);

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);

});


restartButton.addEventListener("click", () => {

    endScreen.style.display = "none";
    gameScreen.style.display = "block";

    resizeCanvas();

    running = true;

    startLevel(1);

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);

});


window.addEventListener("resize", resizeCanvas);


// ==========================================
// RESIZE
// ==========================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}


// ==========================================
// START LEVEL
// ==========================================

function startLevel(newLevel) {

    level = newLevel;

    health = 100;
    hasKey = false;
    timeLeft = 120;

    timerCounter = 0;

    path = [];
    pathTimer = 0;

    createWorld();

    updateHUD();

}


// ==========================================
// CREATE WORLD
// ==========================================

function createWorld() {

    walls = [];
    decorations = [];

    const w = canvas.width;
    const h = canvas.height;


    // ======================================
    // LEVEL 1
    // ======================================

    if (level === 1) {

        player = {
            x: 90,
            y: h / 2,
            radius: 18,
            speed: 210
        };

        enemy = {
            x: 230,
            y: h / 2 - 90,
            radius: 20,

            // FAST ENEMY
            speed: 245,

            hitCooldown: 0
        };


        exitZone = {
            x: w - 100,
            y: h - 120,
            width: 60,
            height: 75
        };


        keyItem = {
            x: w * 0.48,
            y: h * 0.25,
            radius: 13
        };


        // OUTER WALLS

        walls.push(
            { x: 30, y: 30, width: w - 60, height: 25 },
            { x: 30, y: h - 55, width: w - 60, height: 25 },
            { x: 30, y: 30, width: 25, height: h - 60 },
            { x: w - 55, y: 30, width: 25, height: h - 60 }
        );


        // INTERIOR WALLS

        walls.push(
            {
                x: w * 0.28,
                y: 100,
                width: 25,
                height: h * 0.55
            },

            {
                x: w * 0.55,
                y: 55,
                width: 25,
                height: h * 0.40
            },

            {
                x: w * 0.55,
                y: h * 0.70,
                width: 25,
                height: h * 0.20
            },

            {
                x: w * 0.72,
                y: h * 0.40,
                width: w * 0.20,
                height: 25
            }
        );


        decorations.push(
            {
                type: "table",
                x: w * 0.16,
                y: h * 0.25
            },

            {
                type: "sofa",
                x: w * 0.40,
                y: h * 0.70
            },

            {
                type: "table",
                x: w * 0.80,
                y: h * 0.20
            },

            {
                type: "bed",
                x: w * 0.82,
                y: h * 0.65
            }
        );


        objective.textContent =
            "FIND THE KEY → REACH THE EXIT";

    }


    // ======================================
    // LEVEL 2
    // ======================================

    else {

        player = {
            x: 100,
            y: 100,
            radius: 18,
            speed: 215
        };


        enemy = {
            x: 260,
            y: 160,
            radius: 21,

            // EVEN FASTER
            speed: 270,

            hitCooldown: 0
        };


        keyItem = {
            x: w * 0.52,
            y: h * 0.48,
            radius: 13
        };


        exitZone = {
            x: w - 170,
            y: h - 130,
            width: 110,
            height: 55
        };


        // ISLAND BORDER

        walls.push(
            { x: 25, y: 25, width: w - 50, height: 25 },
            { x: 25, y: h - 50, width: w - 50, height: 25 },
            { x: 25, y: 25, width: 25, height: h - 50 },
            { x: w - 50, y: 25, width: 25, height: h - 50 }
        );


        // BUILDINGS

        walls.push(
            {
                x: w * 0.30,
                y: h * 0.20,
                width: 150,
                height: 100
            },

            {
                x: w * 0.65,
                y: h * 0.22,
                width: 140,
                height: 100
            },

            {
                x: w * 0.34,
                y: h * 0.65,
                width: 170,
                height: 90
            }
        );


        // FENCES

        walls.push(
            {
                x: w * 0.08,
                y: h * 0.60,
                width: 150,
                height: 15
            },

            {
                x: w * 0.70,
                y: h * 0.65,
                width: 140,
                height: 15
            }
        );


        // TREES

        for (let i = 0; i < 18; i++) {

            let tx;
            let ty;

            do {

                tx = 80 + Math.random() * (w - 160);
                ty = 70 + Math.random() * (h - 140);

            } while (
                distance(tx, ty, player.x, player.y) < 100 ||
                distance(tx, ty, exitZone.x, exitZone.y) < 120
            );


            decorations.push({
                type: "tree",
                x: tx,
                y: ty
            });

        }


        objective.textContent =
            "FIND THE KEY → REACH THE BOAT";

    }

}


// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(time) {

    if (!running) return;

    const dt = Math.min(
        (time - lastTime) / 1000,
        0.05
    );

    lastTime = time;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);

}


// ==========================================
// UPDATE
// ==========================================

function update(dt) {

    if (!player || !enemy) return;

    movePlayer(dt);

    moveEnemy(dt);

    collectKey();

    checkEnemy();

    checkExit();


    timerCounter += dt;

    if (timerCounter >= 1) {

        timerCounter = 0;

        timeLeft--;

        if (timeLeft <= 0) {

            loseGame("TIME RAN OUT");

        }

    }


    updateHUD();

}


// ==========================================
// PLAYER
// ==========================================

function movePlayer(dt) {

    let dx = 0;
    let dy = 0;


    if (keys["w"] || keys["arrowup"]) dy--;
    if (keys["s"] || keys["arrowdown"]) dy++;

    if (keys["a"] || keys["arrowleft"]) dx--;
    if (keys["d"] || keys["arrowright"]) dx++;


    if (dx === 0 && dy === 0) return;


    const length = Math.sqrt(dx * dx + dy * dy);

    dx /= length;
    dy /= length;


    let speed = player.speed;


    if (keys["shift"]) {

        speed = 285;

    }


    tryMove(
        player,
        dx * speed * dt,
        0
    );


    tryMove(
        player,
        0,
        dy * speed * dt
    );

}


// ==========================================
// ENEMY AI
// ==========================================

function moveEnemy(dt) {

    if (enemy.hitCooldown > 0) {
        enemy.hitCooldown -= dt;
    }


    // Recalculate path several times per second.
    // This means the enemy constantly updates
    // where the player is going.

    pathTimer -= dt;


    if (pathTimer <= 0) {

        pathTimer = 0.25;

        path = findPath(
            enemy.x,
            enemy.y,
            player.x,
            player.y
        );

    }


    if (path.length === 0) {

        // Emergency direct movement if path
        // isn't available.

        chaseDirectly(dt);

        return;
    }


    const target = path[0];


    let dx = target.x - enemy.x;
    let dy = target.y - enemy.y;

    const dist = Math.sqrt(dx * dx + dy * dy);


    if (dist < 8) {

        path.shift();

        return;

    }


    dx /= dist;
    dy /= dist;


    tryMove(
        enemy,
        dx * enemy.speed * dt,
        0
    );


    tryMove(
        enemy,
        0,
        dy * enemy.speed * dt
    );

}


// ==========================================
// DIRECT CHASE FALLBACK
// ==========================================

function chaseDirectly(dt) {

    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;

    const dist = Math.sqrt(dx * dx + dy * dy);


    if (dist < 1) return;


    dx /= dist;
    dy /= dist;


    tryMove(
        enemy,
        dx * enemy.speed * dt,
        0
    );


    tryMove(
        enemy,
        0,
        dy * enemy.speed * dt
    );

}


// ==========================================
// A* PATHFINDING
// ==========================================

function findPath(startX, startY, targetX, targetY) {

    const cols = Math.ceil(canvas.width / GRID_SIZE);
    const rows = Math.ceil(canvas.height / GRID_SIZE);


    const start = worldToGrid(startX, startY);
    const goal = worldToGrid(targetX, targetY);


    if (
        !insideGrid(start.x, start.y, cols, rows) ||
        !insideGrid(goal.x, goal.y, cols, rows)
    ) {
        return [];
    }


    const open = [];
    const closed = new Set();


    const startNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: heuristic(start, goal),
        parent: null
    };


    startNode.f = startNode.g + startNode.h;

    open.push(startNode);


    let safety = 0;


    while (open.length > 0 && safety < 2500) {

        safety++;


        // Find lowest F score.

        let bestIndex = 0;

        for (let i = 1; i < open.length; i++) {

            if (open[i].f < open[bestIndex].f) {

                bestIndex = i;

            }

        }


        const current = open.splice(bestIndex, 1)[0];

        const currentKey =
            current.x + "," + current.y;


        if (closed.has(currentKey)) {
            continue;
        }


        closed.add(currentKey);


        // GOAL REACHED

        if (
            current.x === goal.x &&
            current.y === goal.y
        ) {

            return reconstructPath(current);

        }


        const neighbors = [

            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },

            // Diagonal movement makes the enemy
            // move more naturally around corners.

            { x: current.x + 1, y: current.y + 1 },
            { x: current.x - 1, y: current.y + 1 },
            { x: current.x + 1, y: current.y - 1 },
            { x: current.x - 1, y: current.y - 1 }

        ];


        for (const neighbor of neighbors) {

            if (
                !insideGrid(
                    neighbor.x,
                    neighbor.y,
                    cols,
                    rows
                )
            ) {
                continue;
            }


            const key =
                neighbor.x + "," + neighbor.y;


            if (closed.has(key)) {
                continue;
            }


            // Don't allow the enemy's body to overlap walls.

            if (
                gridCellBlocked(
                    neighbor.x,
                    neighbor.y,
                    enemy.radius
                )
            ) {
                continue;
            }


            // Prevent diagonal movement through
            // the corner of two walls.

            if (
                neighbor.x !== current.x &&
                neighbor.y !== current.y
            ) {

                if (
                    gridCellBlocked(
                        neighbor.x,
                        current.y,
                        enemy.radius
                    ) ||
                    gridCellBlocked(
                        current.x,
                        neighbor.y,
                        enemy.radius
                    )
                ) {
                    continue;
                }

            }


            const diagonal =
                neighbor.x !== current.x &&
                neighbor.y !== current.y;


            const movementCost =
                diagonal ? 1.414 : 1;


            const g =
                current.g + movementCost;


            const existing =
                open.find(
                    n =>
                        n.x === neighbor.x &&
                        n.y === neighbor.y
                );


            if (
                existing &&
                g >= existing.g
            ) {
                continue;
            }


            const node = {

                x: neighbor.x,
                y: neighbor.y,

                g: g,

                h: heuristic(
                    neighbor,
                    goal
                ),

                parent: current

            };


            node.f = node.g + node.h;

            open.push(node);

        }

    }


    return [];

}


// ==========================================
// RECONSTRUCT PATH
// ==========================================

function reconstructPath(node) {

    const result = [];

    let current = node;


    while (current.parent) {

        result.unshift({
            x: current.x * GRID_SIZE + GRID_SIZE / 2,
            y: current.y * GRID_SIZE + GRID_SIZE / 2
        });

        current = current.parent;

    }


    // Don't make the enemy walk every tiny grid
    // point. Keep only useful waypoints.

    const simplified = [];

    for (
        let i = 0;
        i < result.length;
        i += 2
    ) {

        simplified.push(result[i]);

    }


    if (result.length > 0) {

        simplified.push(
            result[result.length - 1]
        );

    }


    return simplified;

}


// ==========================================
// GRID HELPERS
// ==========================================

function worldToGrid(x, y) {

    return {

        x: Math.floor(x / GRID_SIZE),
        y: Math.floor(y / GRID_SIZE)

    };

}


function insideGrid(x, y, cols, rows) {

    return (
        x >= 0 &&
        y >= 0 &&
        x < cols &&
        y < rows
    );

}


function gridCellBlocked(gx, gy, radius) {

    const x =
        gx * GRID_SIZE +
        GRID_SIZE / 2;

    const y =
        gy * GRID_SIZE +
        GRID_SIZE / 2;


    // Slightly enlarge the collision check
    // so the enemy doesn't scrape walls.

    const testObject = {

        x: x,
        y: y,

        radius: radius + 4

    };


    return collidesWithWalls(testObject);

}


function heuristic(a, b) {

    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);

    return dx + dy;

}


// ==========================================
// COLLISION
// ==========================================

function tryMove(object, dx, dy) {

    const oldX = object.x;
    const oldY = object.y;


    object.x += dx;

    if (collidesWithWalls(object)) {

        object.x = oldX;

    }


    object.y += dy;

    if (collidesWithWalls(object)) {

        object.y = oldY;

    }

}


function collidesWithWalls(object) {

    for (const wall of walls) {

        const closestX = Math.max(
            wall.x,
            Math.min(
                object.x,
                wall.x + wall.width
            )
        );


        const closestY = Math.max(
            wall.y,
            Math.min(
                object.y,
                wall.y + wall.height
            )
        );


        const dx =
            object.x - closestX;

        const dy =
            object.y - closestY;


        if (
            dx * dx +
            dy * dy <
            object.radius *
            object.radius
        ) {

            return true;

        }

    }


    return false;

}


// ==========================================
// KEY
// ==========================================

function collectKey() {

    if (hasKey || !keyItem) return;


    if (
        distance(
            player.x,
            player.y,
            keyItem.x,
            keyItem.y
        ) < 45
    ) {

        hasKey = true;

        showMessage("KEY FOUND!");


        objective.textContent =
            level === 1
                ? "REACH THE EXIT"
                : "REACH THE BOAT";

    }

}


// ==========================================
// ENEMY DAMAGE
// ==========================================

function checkEnemy() {

    if (enemy.hitCooldown > 0) return;


    const d = distance(
        player.x,
        player.y,
        enemy.x,
        enemy.y
    );


    if (
        d <
        player.radius +
        enemy.radius +
        5
    ) {

        health -= 20;

        enemy.hitCooldown = 1.2;


        // Push enemy back slightly.

        const dx =
            enemy.x - player.x;

        const dy =
            enemy.y - player.y;


        const len =
            Math.sqrt(
                dx * dx +
                dy * dy
            ) || 1;


        enemy.x +=
            (dx / len) * 65;

        enemy.y +=
            (dy / len) * 65;


        // Recalculate immediately after contact.

        path = findPath(
            enemy.x,
            enemy.y,
            player.x,
            player.y
        );


        showMessage("RUN!");


        if (health <= 0) {

            loseGame("YOU WERE CAUGHT");

        }

    }

}


// ==========================================
// EXIT
// ==========================================

function checkExit() {

    if (!hasKey) return;


    const inside =
        player.x > exitZone.x &&
        player.x <
        exitZone.x +
        exitZone.width &&

        player.y > exitZone.y &&
        player.y <
        exitZone.y +
        exitZone.height;


    if (!inside) return;


    if (level === 1) {

        showMessage("ESCAPED THE MANSION!");


        running = false;


        setTimeout(() => {

            running = true;

            startLevel(2);

            lastTime = performance.now();

            requestAnimationFrame(gameLoop);

        }, 700);


    } else {

        winGame();

    }

}


// ==========================================
// HUD
// ==========================================

function updateHUD() {

    levelText.textContent = level;

    healthText.textContent =
        Math.max(0, health);

    keyText.textContent =
        hasKey ? "YES" : "NO";

    timeText.textContent =
        Math.max(0, timeLeft);

}


// ==========================================
// DRAW
// ==========================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (level === 1) {

        drawMansionBackground();

    } else {

        drawIslandBackground();

    }


    drawExit();


    if (!hasKey) {

        drawKey();

    }


    drawWalls();

    drawDecorations();

    drawEnemy();

    drawPlayer();

    drawVignette();

}


// ==========================================
// MANSION
// ==========================================

function drawMansionBackground() {

    ctx.fillStyle = "#171717";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.strokeStyle = "#252525";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }

}


// ==========================================
// ISLAND
// ==========================================

function drawIslandBackground() {

    ctx.fillStyle = "#4b713b";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.strokeStyle = "#416432";


    for (
        let x = 0;
        x < canvas.width;
        x += 40
    ) {

        for (
            let y = 0;
            y < canvas.height;
            y += 40
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x + 10,
                y + 20
            );

            ctx.lineTo(
                x + 18,
                y + 15
            );

            ctx.stroke();

        }

    }

}


// ==========================================
// WALLS
// ==========================================

function drawWalls() {

    for (const wall of walls) {

        ctx.fillStyle =
            level === 1
                ? "#3b3b3b"
                : "#6b5136";


        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        ctx.strokeStyle = "#111";

        ctx.lineWidth = 3;


        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );

    }

}


// ==========================================
// DECORATIONS
// ==========================================

function drawDecorations() {

    for (const item of decorations) {

        if (item.type === "tree") {

            ctx.fillStyle = "#513820";

            ctx.fillRect(
                item.x - 5,
                item.y,
                10,
                28
            );


            ctx.fillStyle = "#183b20";

            ctx.beginPath();

            ctx.arc(
                item.x,
                item.y - 5,
                25,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle = "#28562d";

            ctx.beginPath();

            ctx.arc(
                item.x - 15,
                item.y + 3,
                17,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }


        if (item.type === "table") {

            ctx.fillStyle = "#71472b";

            ctx.fillRect(
                item.x,
                item.y,
                75,
                35
            );


            ctx.fillStyle = "#4b2d1b";

            ctx.fillRect(
                item.x + 8,
                item.y + 35,
                8,
                25
            );

            ctx.fillRect(
                item.x + 59,
                item.y + 35,
                8,
                25
            );

        }


        if (item.type === "sofa") {

            ctx.fillStyle = "#684141";

            ctx.fillRect(
                item.x,
                item.y,
                110,
                55
            );


            ctx.fillStyle = "#824f4f";

            ctx.fillRect(
                item.x + 10,
                item.y - 18,
                90,
                25
            );

        }


        if (item.type === "bed") {

            ctx.fillStyle = "#574f65";

            ctx.fillRect(
                item.x,
                item.y,
                120,
                60
            );


            ctx.fillStyle = "#c9c9c9";

            ctx.fillRect(
                item.x + 10,
                item.y + 10,
                100,
                25
            );

        }

    }

}


// ==========================================
// KEY
// ==========================================

function drawKey() {

    const pulse =
        Math.sin(
            performance.now() / 180
        ) * 3;


    ctx.save();

    ctx.shadowBlur = 20;

    ctx.shadowColor = "#ffe45c";

    ctx.fillStyle = "#ffd83d";


    ctx.beginPath();

    ctx.arc(
        keyItem.x,
        keyItem.y + pulse,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillRect(
        keyItem.x + 7,
        keyItem.y - 3 + pulse,
        30,
        6
    );


    ctx.fillRect(
        keyItem.x + 27,
        keyItem.y - 3 + pulse,
        6,
        13
    );


    ctx.restore();

}


// ==========================================
// EXIT
// ==========================================

function drawExit() {

    if (level === 1) {

        ctx.fillStyle =
            hasKey
                ? "#2d9d55"
                : "#493939";


        ctx.fillRect(
            exitZone.x,
            exitZone.y,
            exitZone.width,
            exitZone.height
        );


        ctx.strokeStyle = "#111";

        ctx.lineWidth = 4;


        ctx.strokeRect(
            exitZone.x,
            exitZone.y,
            exitZone.width,
            exitZone.height
        );


        ctx.fillStyle = "white";

        ctx.font = "bold 12px Arial";

        ctx.textAlign = "center";


        ctx.fillText(
            hasKey ? "EXIT" : "LOCKED",
            exitZone.x +
            exitZone.width / 2,
            exitZone.y + 40
        );

    }

    else {

        // WATER

        ctx.fillStyle = "#2f6f91";

        ctx.fillRect(
            exitZone.x - 15,
            exitZone.y - 15,
            exitZone.width + 30,
            exitZone.height + 30
        );


        // BOAT

        ctx.fillStyle = "#6b3f25";

        ctx.beginPath();

        ctx.moveTo(
            exitZone.x,
            exitZone.y + 10
        );

        ctx.lineTo(
            exitZone.x +
            exitZone.width,
            exitZone.y + 10
        );

        ctx.lineTo(
            exitZone.x +
            exitZone.width - 15,
            exitZone.y +
            exitZone.height
        );

        ctx.lineTo(
            exitZone.x + 15,
            exitZone.y +
            exitZone.height
        );

        ctx.closePath();

        ctx.fill();


        // BOAT TOP

        ctx.fillStyle = "#9a6b3d";

        ctx.fillRect(
            exitZone.x + 20,
            exitZone.y,
            exitZone.width - 40,
            15
        );


        ctx.fillStyle = "white";

        ctx.font = "bold 12px Arial";

        ctx.textAlign = "center";


        ctx.fillText(
            hasKey ? "ESCAPE" : "LOCKED",
            exitZone.x +
            exitZone.width / 2,
            exitZone.y + 42
        );

    }

}


// ==========================================
// PLAYER
// ==========================================

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        20,
        22,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Legs

    ctx.fillStyle = "#17263d";

    ctx.fillRect(
        -12,
        7,
        9,
        18
    );

    ctx.fillRect(
        3,
        7,
        9,
        18
    );


    // Body

    ctx.fillStyle = "#2764a8";

    ctx.fillRect(
        -15,
        -10,
        30,
        25
    );


    // Head

    ctx.fillStyle = "#d99b70";

    ctx.beginPath();

    ctx.arc(
        0,
        -23,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Hair

    ctx.fillStyle = "#2b1b13";

    ctx.beginPath();

    ctx.arc(
        0,
        -28,
        13,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -5,
        -24,
        3,
        3
    );

    ctx.fillRect(
        3,
        -24,
        3,
        3
    );


    ctx.restore();

}


// ==========================================
// ENEMY
// ==========================================

function drawEnemy() {

    ctx.save();

    ctx.translate(
        enemy.x,
        enemy.y
    );


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.4)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        22,
        25,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Legs

    ctx.fillStyle = "#161616";

    ctx.fillRect(
        -12,
        8,
        9,
        20
    );

    ctx.fillRect(
        3,
        8,
        9,
        20
    );


    // Body

    ctx.fillStyle = "#761d25";

    ctx.fillRect(
        -17,
        -10,
        34,
        25
    );


    // Head

    ctx.fillStyle = "#b86e52";

    ctx.beginPath();

    ctx.arc(
        0,
        -24,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Hair

    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        0,
        -29,
        15,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle = "#f5f5f5";

    ctx.fillRect(
        -6,
        -25,
        4,
        4
    );

    ctx.fillRect(
        3,
        -25,
        4,
        4
    );


    // Alert

    ctx.fillStyle = "#ff3333";

    ctx.font = "bold 22px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "!",
        0,
        -48
    );


    ctx.restore();

}


// ==========================================
// VIGNETTE
// ==========================================

function drawVignette() {

    const gradient =
        ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.height * 0.2,

            canvas.width / 2,
            canvas.height / 2,
            canvas.height * 0.8
        );


    gradient.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0.55)"
    );


    ctx.fillStyle = gradient;


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


// ==========================================
// WIN
// ==========================================

function winGame() {

    running = false;

    endTitle.textContent =
        "YOU ESCAPED";


    endText.textContent =
        "You found the boat and escaped the island. You survived both levels.";


    gameScreen.style.display = "none";

    endScreen.style.display = "flex";

}


// ==========================================
// LOSE
// ==========================================

function loseGame(reason) {

    running = false;

    endTitle.textContent =
        "GAME OVER";


    endText.textContent =
        reason;


    gameScreen.style.display = "none";

    endScreen.style.display = "flex";

}


// ==========================================
// MESSAGE
// ==========================================

let messageTimeout;

function showMessage(text) {

    message.textContent = text;

    message.style.opacity = "1";


    clearTimeout(messageTimeout);


    messageTimeout =
        setTimeout(() => {

            message.style.opacity = "0";

        }, 900);

}


// ==========================================
// DISTANCE
// ==========================================

function distance(
    x1,
    y1,
    x2,
    y2
) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}