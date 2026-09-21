"use strict";

/* =====================================================
   ESCAPE MODE
   KINETIC STUDIOS

   NEW MAP:
   - Huge doorways
   - Safe spawn
   - No furniture near spawn
   - Clear route through mansion
   - Hunter cannot spawn inside walls
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const end = document.getElementById("end");

const startButton = document.getElementById("startButton");
const restart = document.getElementById("restart");

const levelUI = document.getElementById("level");
const objectiveUI = document.getElementById("objective");
const healthUI = document.getElementById("health");
const staminaUI = document.getElementById("stamina");
const itemUI = document.getElementById("item");
const timerUI = document.getElementById("timer");

const warning = document.getElementById("warning");
const prompt = document.getElementById("prompt");
const message = document.getElementById("message");

const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");
const finalTime = document.getElementById("finalTime");
const finalLevel = document.getElementById("finalLevel");

const joystickElement =
    document.getElementById("joystick");

const knob =
    document.getElementById("knob");

const runButton =
    document.getElementById("runButton");

const interactButton =
    document.getElementById("interactButton");


/* =====================================================
   SCREEN
===================================================== */

let W = window.innerWidth;
let H = window.innerHeight;

function resize() {

    W = window.innerWidth;
    H = window.innerHeight;

    const dpr =
        Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener("resize", resize);

resize();


/* =====================================================
   GAME STATE
===================================================== */

let playing = false;

let level = 1;

let startTime = 0;

let elapsed = 0;

let lastFrame = 0;

const keys = {};

const camera = {
    x: 0,
    y: 0,
    shake: 0
};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 450,
    y: 1000,

    radius: 18,

    health: 100,

    stamina: 100,

    speed: 220,

    sprintSpeed: 330,

    facing: 0,

    animation: 0,

    moving: false,

    sprinting: false
};


/* =====================================================
   HUNTER
===================================================== */

const hunter = {

    x: 2700,
    y: 300,

    radius: 23,

    speed: 205,

    targetX: 2700,

    targetY: 300,

    lastX: 2700,

    lastY: 300,

    state: "patrol",

    timer: 0,

    animation: 0
};


/* =====================================================
   WORLD
===================================================== */

const world = {

    width: 0,

    height: 0,

    walls: [],

    furniture: [],

    objects: [],

    decorations: [],

    particles: [],

    exit: null
};

let item = null;


/* =====================================================
   INPUT
===================================================== */

window.addEventListener("keydown", event => {

    keys[event.key.toLowerCase()] = true;

    if (
        event.key.toLowerCase() === "e"
    ) {
        interact();
    }
});

window.addEventListener("keyup", event => {

    keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {

    for (const key in keys) {
        keys[key] = false;
    }

    mobileRunning = false;
});


/* =====================================================
   START
===================================================== */

startButton.addEventListener(
    "click",
    startGame
);

restart.addEventListener(
    "click",
    startGame
);


function startGame() {

    menu.classList.add("hidden");

    end.classList.add("hidden");

    game.classList.remove("hidden");

    level = 1;

    item = null;

    player.health = 100;

    player.stamina = 100;

    startTime = performance.now();

    elapsed = 0;

    buildMansion();

    playing = true;

    lastFrame = performance.now();

    showMessage(
        "SEARCH THE MANSION AND FIND THE KEY",
        3500
    );

    requestAnimationFrame(gameLoop);
}


/* =====================================================
   NEW MANSION
===================================================== */

function buildMansion() {

    world.width = 3200;
    world.height = 2200;

    world.walls = [];
    world.furniture = [];
    world.objects = [];
    world.decorations = [];
    world.particles = [];

    /*
       ==================================================
       SAFE SPAWN
       ==================================================

       Player starts in the middle of a giant room.
       Nothing is within ~250 pixels of the player.
    */

    player.x = 450;
    player.y = 1000;

    /*
       Hunter starts far away.
    */

    hunter.x = 2750;
    hunter.y = 350;

    hunter.targetX = hunter.x;
    hunter.targetY = hunter.y;

    hunter.state = "patrol";

    /*
       ==================================================
       OUTER BUILDING
    ==================================================
    */

    wall(0, 0, 3200, 70);

    wall(
        0,
        2130,
        3200,
        70
    );

    wall(
        0,
        0,
        70,
        2200
    );

    wall(
        3130,
        0,
        70,
        2200
    );


    /*
       ==================================================
       HUGE HORIZONTAL DOORS
       ==================================================
    */

    /*
       LEFT SIDE
       Room separator at y=650
       Door = 400 pixels wide
    */

    wall(70, 650, 300, 40);
    wall(770, 650, 300, 40);


    /*
       LEFT SIDE
       Room separator at y=1350
       Door = 400 pixels wide
    */

    wall(70, 1350, 300, 40);
    wall(770, 1350, 300, 40);


    /*
       RIGHT SIDE
    */

    wall(2130, 650, 300, 40);
    wall(2830, 650, 300, 40);

    wall(2130, 1350, 300, 40);
    wall(2830, 1350, 300, 40);


    /*
       ==================================================
       CENTRAL HALL
       ==================================================
    */

    /*
       Left central wall.
       THREE HUGE openings.
    */

    wall(1070, 70, 40, 300);

    wall(1070, 600, 40, 400);

    wall(1070, 1200, 40, 500);

    wall(1070, 1900, 40, 230);


    /*
       Right central wall.
    */

    wall(2090, 70, 40, 300);

    wall(2090, 600, 40, 400);

    wall(2090, 1200, 40, 500);

    wall(2090, 1900, 40, 230);


    /*
       ==================================================
       SPAWN ROOM
       ==================================================

       NO furniture here.
       Huge empty floor.
    */

    furniture(
        150,
        180,
        220,
        80,
        "sofa"
    );

    furniture(
        680,
        180,
        220,
        80,
        "sofa"
    );


    /*
       ==================================================
       OTHER ROOMS
       ==================================================
    */

    furniture(
        140,
        800,
        180,
        90,
        "bed"
    );

    furniture(
        700,
        800,
        180,
        90,
        "bed"
    );


    furniture(
        150,
        1530,
        240,
        90,
        "desk"
    );

    furniture(
        670,
        1530,
        220,
        90,
        "cabinet"
    );


    furniture(
        2250,
        800,
        180,
        90,
        "bed"
    );

    furniture(
        2800,
        800,
        180,
        90,
        "bed"
    );


    furniture(
        2250,
        1530,
        240,
        90,
        "desk"
    );

    furniture(
        2780,
        1530,
        220,
        90,
        "cabinet"
    );


    /*
       ==================================================
       CENTRAL HALL FURNITURE
       ==================================================
    */

    furniture(
        1250,
        250,
        650,
        110,
        "table"
    );

    furniture(
        1250,
        820,
        650,
        100,
        "table"
    );

    furniture(
        1250,
        1450,
        650,
        100,
        "table"
    );


    /*
       ==================================================
       SEARCHABLE OBJECTS
       ==================================================
    */

    object(
        250,
        1600,
        "drawer",
        false
    );

    object(
        500,
        1600,
        "cabinet",
        false
    );

    object(
        800,
        1600,
        "desk",
        false
    );


    /*
       THE REAL KEY
       Far from spawn.
    */

    object(
        820,
        1100,
        "golden key",
        true
    );


    /*
       ==================================================
       EXIT
       ==================================================
    */

    world.exit = {

        x: 1450,

        y: 1990,

        width: 220,

        height: 90
    };


    /*
       DECORATIONS
    */

    for (let i = 0; i < 45; i++) {

        world.decorations.push({

            type: "lamp",

            x:
                120 +
                Math.random() * 2950,

            y:
                100 +
                Math.random() * 1900
        });
    }


    for (let i = 0; i < 25; i++) {

        world.decorations.push({

            type: "painting",

            x:
                120 +
                Math.random() * 2900,

            y:
                90 +
                Math.random() * 1850
        });
    }


    makeParticles(150);

    updateHUD();
}


/* =====================================================
   ISLAND
===================================================== */
function buildIsland() {

    world.width = 4400;
    world.height = 3000;

    world.walls = [];
    world.furniture = [];
    world.objects = [];
    world.decorations = [];
    world.particles = [];

    // SAFE SPAWN
    player.x = 450;
    player.y = 450;

    player.health = 100;
    player.stamina = 100;

    item = null;

    // HUNTER STARTS FAR AWAY
    hunter.x = 3500;
    hunter.y = 2100;

    hunter.targetX = hunter.x;
    hunter.targetY = hunter.y;

    hunter.state = "patrol";

    // =================================================
    // OUTER BORDER
    // =================================================

    wall(0, 0, 4400, 100);
    wall(0, 2900, 4400, 100);
    wall(0, 0, 100, 3000);
    wall(4300, 0, 100, 3000);


    // =================================================
    // ISLAND PATHS
    // =================================================

    /*
       IMPORTANT:

       The main roads are NOT blocked.

       Spawn
          ↓
       Open road
          ↓
       Dock Key
          ↓
       Open road
          ↓
       Boat
    */

    // Small road from spawn
    wall(
        1200,
        100,
        60,
        600
    );

    // Left-side building boundaries
    wall(
        150,
        850,
        650,
        35
    );

    wall(
        150,
        1250,
        650,
        35
    );

    wall(
        150,
        850,
        35,
        435
    );

    wall(
        765,
        850,
        35,
        435
    );


    // =================================================
    // CENTRAL BUILDING
    // =================================================

    wall(
        1500,
        200,
        600,
        35
    );

    wall(
        1500,
        650,
        600,
        35
    );

    wall(
        1500,
        200,
        35,
        450
    );

    wall(
        2065,
        200,
        35,
        450
    );


    // =================================================
    // RIGHT BUILDING
    // =================================================

    wall(
        2750,
        700,
        650,
        35
    );

    wall(
        2750,
        1150,
        650,
        35
    );

    wall(
        2750,
        700,
        35,
        450
    );

    wall(
        3365,
        700,
        35,
        450
    );


    // =================================================
    // HUGE OPEN ROAD
    // =================================================

    /*
       Vertical road
       No walls across it.
    */

    wall(
        2150,
        100,
        70,
        1100
    );

    /*
       Bottom road boundaries.
    */

    wall(
        500,
        1550,
        1000,
        60
    );

    wall(
        2500,
        1550,
        1000,
        60
    );


    // =================================================
    // DOCK KEY
    // =================================================

    /*
       THIS IS THE IMPORTANT FIX.

       The key is NOT inside a building.

       It is sitting in the open on the island.
    */

    object(
        1900,
        1450,
        "dock key",
        true
    );


    // =================================================
    // BOAT / EXTRACTION
    // =================================================

    world.exit = {

        x: 3700,

        y: 2450,

        width: 300,

        height: 120
    };


    // =================================================
    // DOCK
    // =================================================

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        world.decorations.push({

            type: "dock",

            x:
                3650 + i * 45,

            y:
                2570
        });
    }


    // =================================================
    // BUILDINGS
    // =================================================

    world.decorations.push({

        type: "building",

        x: 150,

        y: 850,

        width: 650,

        height: 435
    });


    world.decorations.push({

        type: "building",

        x: 1500,

        y: 200,

        width: 600,

        height: 450
    });


    world.decorations.push({

        type: "building",

        x: 2750,

        y: 700,

        width: 650,

        height: 450
    });


    // =================================================
    // TREES
    // =================================================

    for (
        let i = 0;
        i < 110;
        i++
    ) {

        let x =
            150 +
            Math.random() *
            4000;

        let y =
            150 +
            Math.random() *
            2400;


        /*
           Keep trees away from the main route.
        */

        if (
            x > 300 &&
            x < 2300 &&
            y > 300 &&
            y < 1700
        ) {
            continue;
        }


        world.decorations.push({

            type: "tree",

            x,

            y,

            size:
                20 +
                Math.random() * 25
        });
    }


    // =================================================
    // ROCKS
    // =================================================

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        world.decorations.push({

            type: "rock",

            x:
                150 +
                Math.random() *
                4000,

            y:
                150 +
                Math.random() *
                2400,

            size:
                8 +
                Math.random() * 18
        });
    }


    // =================================================
    // PARTICLES
    // =================================================

    makeParticles(180);

    updateHUD();

    showMessage(
        "LEVEL 2 — FIND THE DOCK KEY",
        3500
    );
}

/* =====================================================
   WORLD OBJECTS
===================================================== */

function wall(x, y, width, height) {

    world.walls.push({

        x,
        y,
        width,
        height
    });
}


function furniture(
    x,
    y,
    width,
    height,
    type
) {

    world.furniture.push({

        x,
        y,
        width,
        height,
        type
    });
}


function object(
    x,
    y,
    name,
    keyObject
) {

    world.objects.push({

        x,
        y,

        width: 70,
        height: 60,

        name,

        keyObject,

        used: false
    });
}


function building(
    x,
    y,
    width,
    height
) {

    wall(
        x,
        y,
        width,
        35
    );

    wall(
        x,
        y + height,
        width,
        35
    );

    wall(
        x,
        y,
        35,
        height
    );

    wall(
        x + width,
        y,
        35,
        height
    );

    world.decorations.push({

        type: "building",

        x,
        y,
        width,
        height
    });
}


function makeParticles(amount) {

    for (let i = 0; i < amount; i++) {

        world.particles.push({

            x:
                Math.random() *
                world.width,

            y:
                Math.random() *
                world.height,

            size:
                1 +
                Math.random() * 3,

            alpha:
                .04 +
                Math.random() * .13
        });
    }
}


/* =====================================================
   COLLISION
===================================================== */

function circleRect(
    x,
    y,
    radius,
    rect
) {

    const closestX =
        Math.max(
            rect.x,
            Math.min(
                x,
                rect.x + rect.width
            )
        );

    const closestY =
        Math.max(
            rect.y,
            Math.min(
                y,
                rect.y + rect.height
            )
        );

    const dx =
        x - closestX;

    const dy =
        y - closestY;

    return (
        dx * dx +
        dy * dy <
        radius * radius
    );
}


function blocked(
    x,
    y,
    radius
) {

    for (const w of world.walls) {

        if (
            circleRect(
                x,
                y,
                radius,
                w
            )
        ) {
            return true;
        }
    }


    for (const f of world.furniture) {

        if (
            circleRect(
                x,
                y,
                radius,
                f
            )
        ) {
            return true;
        }
    }

    return false;
}


/* =====================================================
   MOVEMENT
===================================================== */

function moveEntity(
    entity,
    dx,
    dy
) {

    const nextX =
        entity.x + dx;

    if (
        !blocked(
            nextX,
            entity.y,
            entity.radius
        )
    ) {

        entity.x = nextX;
    }


    const nextY =
        entity.y + dy;

    if (
        !blocked(
            entity.x,
            nextY,
            entity.radius
        )
    ) {

        entity.y = nextY;
    }
}


/* =====================================================
   PLAYER
===================================================== */

function updatePlayer(dt) {

    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy--;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy++;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx--;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx++;
    }


    dx += joystick.x;
    dy += joystick.y;


    const length =
        Math.hypot(dx, dy);


    if (length > 1) {

        dx /= length;
        dy /= length;
    }


    player.moving =
        Math.abs(dx) > .04 ||
        Math.abs(dy) > .04;


    const wantsSprint =
        keys["shift"] ||
        mobileRunning;


    player.sprinting =
        wantsSprint &&
        player.moving &&
        player.stamina > 1;


    let speed =
        player.speed;


    if (player.sprinting) {

        speed =
            player.sprintSpeed;

        player.stamina -=
            38 * dt;

    } else {

        player.stamina +=
            23 * dt;
    }


    player.stamina =
        Math.max(
            0,
            Math.min(
                100,
                player.stamina
            )
        );


    if (player.moving) {

        player.facing =
            Math.atan2(
                dy,
                dx
            );

        player.animation +=
            dt *
            (
                player.sprinting
                    ? 12
                    : 8
            );


        moveEntity(
            player,
            dx * speed * dt,
            dy * speed * dt
        );
    }
}


/* =====================================================
   LINE OF SIGHT
===================================================== */

function lineOfSight(
    x1,
    y1,
    x2,
    y2
) {

    const distance =
        Math.hypot(
            x2 - x1,
            y2 - y1
        );

    const steps =
        Math.ceil(
            distance / 25
        );


    for (
        let i = 0;
        i <= steps;
        i++
    ) {

        const t =
            i / steps;


        const x =
            x1 +
            (x2 - x1) * t;


        const y =
            y1 +
            (y2 - y1) * t;


        if (
            blocked(
                x,
                y,
                4
            )
        ) {

            return false;
        }
    }


    return true;
}


/* =====================================================
   HUNTER AI
===================================================== */

function updateHunter(dt) {

    const dx =
        player.x -
        hunter.x;

    const dy =
        player.y -
        hunter.y;

    const distance =
        Math.hypot(
            dx,
            dy
        );


    const visible =
        distance < 1100 &&
        lineOfSight(
            hunter.x,
            hunter.y,
            player.x,
            player.y
        );


    if (visible) {

        hunter.state =
            "chase";

        hunter.lastX =
            player.x;

        hunter.lastY =
            player.y;

        hunter.timer = 6;
    }


    if (
        hunter.state ===
        "chase"
    ) {

        hunter.timer -= dt;


        const prediction =
            player.sprinting
                ? .7
                : .4;


        hunter.targetX =
            player.x +
            Math.cos(
                player.facing
            ) *
            player.speed *
            prediction;


        hunter.targetY =
            player.y +
            Math.sin(
                player.facing
            ) *
            player.speed *
            prediction;


        smartHunterMove(
            hunter.targetX,
            hunter.targetY,
            player.sprinting
                ? 285
                : 245,
            dt
        );


        if (
            hunter.timer <= 0
        ) {

            hunter.state =
                "search";
        }

    }

    else if (
        hunter.state ===
        "search"
    ) {

        smartHunterMove(
            hunter.lastX,
            hunter.lastY,
            190,
            dt
        );


        const d =
            Math.hypot(
                hunter.x -
                hunter.lastX,

                hunter.y -
                hunter.lastY
            );


        if (d < 60) {

            hunter.state =
                "patrol";
        }

    }

    else {

        if (
            Math.hypot(
                hunter.x -
                hunter.targetX,

                hunter.y -
                hunter.targetY
            ) < 80
        ) {

            hunter.targetX =
                150 +
                Math.random() *
                (
                    world.width -
                    300
                );

            hunter.targetY =
                150 +
                Math.random() *
                (
                    world.height -
                    300
                );
        }


        smartHunterMove(
            hunter.targetX,
            hunter.targetY,
            145,
            dt
        );
    }


    hunter.animation +=
        dt * 8;


    /*
       Contact.
    */

    if (distance < 48) {

        player.health -=
            30 * dt;

        camera.shake = 5;


        if (
            player.health <= 0
        ) {

            player.health = 0;

            loseGame();
        }
    }


    if (distance < 500) {

        warning.classList.add(
            "show"
        );

    } else {

        warning.classList.remove(
            "show"
        );
    }
}


/* =====================================================
   SMART HUNTER MOVEMENT
===================================================== */

function smartHunterMove(
    targetX,
    targetY,
    speed,
    dt
) {

    let dx =
        targetX -
        hunter.x;

    let dy =
        targetY -
        hunter.y;


    const distance =
        Math.hypot(
            dx,
            dy
        );


    if (distance < 3) {
        return;
    }


    dx /= distance;
    dy /= distance;


    /*
       Try several directions.
    */

    const angles = [

        0,

        .35,
        -.35,

        .7,
        -.7,

        1.1,
        -1.1,

        1.5,
        -1.5
    ];


    let bestX = dx;
    let bestY = dy;

    let bestScore = -999;


    for (
        const angle of angles
    ) {

        const c =
            Math.cos(angle);

        const s =
            Math.sin(angle);


        const rx =
            dx * c -
            dy * s;


        const ry =
            dx * s +
            dy * c;


        const testX =
            hunter.x +
            rx * 65;


        const testY =
            hunter.y +
            ry * 65;


        if (
            !blocked(
                testX,
                testY,
                hunter.radius
            )
        ) {

            const score =
                rx * dx +
                ry * dy;


            if (
                score >
                bestScore
            ) {

                bestScore =
                    score;

                bestX = rx;
                bestY = ry;
            }
        }
    }


    moveEntity(
        hunter,
        bestX *
        speed *
        dt,

        bestY *
        speed *
        dt
    );
}


/* =====================================================
   INTERACTION
===================================================== */

function interact() {

    if (!playing) {
        return;
    }


    let nearest = null;

    let nearestDistance =
        Infinity;


    for (
        const object of world.objects
    ) {

        if (object.used) {
            continue;
        }


        const distance =
            Math.hypot(
                player.x -
                object.x,

                player.y -
                object.y
            );


        if (
            distance < 120 &&
            distance <
            nearestDistance
        ) {

            nearest =
                object;

            nearestDistance =
                distance;
        }
    }


    if (!nearest) {
        return;
    }


    nearest.used = true;


    if (
        nearest.keyObject
    ) {

        item =
            level === 1
                ? "MANSION KEY"
                : "DOCK KEY";


        showMessage(

            level === 1
                ? "YOU FOUND THE MANSION KEY!"
                : "YOU FOUND THE DOCK KEY!",

            3000
        );


        updateHUD();

    } else {

        const messages = [

            "EMPTY.",

            "NOTHING USEFUL.",

            "OLD PAPERS.",

            "JUST DUST.",

            "NOTHING HERE."

        ];


        showMessage(

            messages[
                Math.floor(
                    Math.random() *
                    messages.length
                )
            ],

            1400
        );
    }
}


/* =====================================================
   EXIT
===================================================== */

function checkExit() {

    const e =
        world.exit;


    if (!e) {
        return;
    }


    const inside =

        player.x >
        e.x &&

        player.x <
        e.x + e.width &&

        player.y >
        e.y &&

        player.y <
        e.y + e.height;


    if (!inside) {
        return;
    }


    if (!item) {

        showMessage(

            level === 1
                ? "FIND THE MANSION KEY FIRST."
                : "FIND THE DOCK KEY FIRST.",

            1600
        );

        return;
    }


    if (level === 1) {

        level = 2;

        item = null;

        buildIsland();

    } else {

        winGame();
    }
}


/* =====================================================
   CAMERA
===================================================== */

function updateCamera(dt) {

    const targetX =
        player.x -
        W / 2;


    const targetY =
        player.y -
        H / 2;


    camera.x +=
        (
            targetX -
            camera.x
        ) *
        Math.min(
            1,
            dt * 7
        );


    camera.y +=
        (
            targetY -
            camera.y
        ) *
        Math.min(
            1,
            dt * 7
        );


    camera.x =
        Math.max(
            0,
            Math.min(
                camera.x,
                world.width -
                W
            )
        );


    camera.y =
        Math.max(
            0,
            Math.min(
                camera.y,
                world.height -
                H
            )
        );


    camera.shake =
        Math.max(
            0,
            camera.shake -
            dt * 15
        );
}


/* =====================================================
   DRAW
===================================================== */

function drawWorld() {

    ctx.save();


    let shakeX = 0;
    let shakeY = 0;


    if (
        camera.shake > 0
    ) {

        shakeX =
            (
                Math.random() -
                .5
            ) *
            camera.shake;


        shakeY =
            (
                Math.random() -
                .5
            ) *
            camera.shake;
    }


    ctx.translate(

        -camera.x +
        shakeX,

        -camera.y +
        shakeY
    );


    if (level === 1) {

        drawMansion();

    } else {

        drawIsland();
    }


    drawExit();

    drawObjects();

    drawFurniture();

    drawPlayer();

    drawHunter();

    drawParticles();


    ctx.restore();


    drawLighting();
}


/* =====================================================
   MANSION DRAW
===================================================== */

function drawMansion() {

    ctx.fillStyle =
        "#303437";


    ctx.fillRect(
        0,
        0,
        world.width,
        world.height
    );


    /*
       Floor tiles.
    */

    for (
        let x = 0;
        x < world.width;
        x += 55
    ) {

        for (
            let y = 0;
            y < world.height;
            y += 55
        ) {

            ctx.fillStyle =

                (
                    (
                        x / 55 +
                        y / 55
                    ) %
                    2 === 0
                )

                    ? "#383c3f"

                    : "#333739";


            ctx.fillRect(
                x,
                y,
                55,
                55
            );
        }
    }


    /*
       Hall rugs.
    */

    rug(
        1120,
        120,
        940,
        420
    );

    rug(
        1130,
        720,
        920,
        320
    );

    rug(
        1130,
        1380,
        920,
        350
    );


    drawWalls();


    for (
        const decoration
        of world.decorations
    ) {

        if (
            decoration.type ===
            "painting"
        ) {

            ctx.fillStyle =
                "#151719";

            ctx.fillRect(
                decoration.x,
                decoration.y,
                80,
                55
            );

            ctx.strokeStyle =
                "#837b69";

            ctx.lineWidth = 5;

            ctx.strokeRect(
                decoration.x,
                decoration.y,
                80,
                55
            );
        }


        if (
            decoration.type ===
            "lamp"
        ) {

            lamp(
                decoration.x,
                decoration.y
            );
        }
    }


    /*
       Big doorway labels.
    */

    drawDoorMarker(
        570,
        650
    );

    drawDoorMarker(
        570,
        1350
    );

    drawDoorMarker(
        2530,
        650
    );

    drawDoorMarker(
        2530,
        1350
    );
}


/* =====================================================
   DOOR MARKER
===================================================== */

function drawDoorMarker(
    x,
    y
) {

    ctx.fillStyle =
        "#625846";

    ctx.fillRect(
        x,
        y - 3,
        200,
        46
    );

    ctx.strokeStyle =
        "#98846b";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        x,
        y - 3,
        200,
        46
    );
}


/* =====================================================
   ISLAND DRAW
===================================================== */

function drawIsland() {

    ctx.fillStyle =
        "#52684d";

    ctx.fillRect(
        0,
        0,
        world.width,
        world.height
    );


    /*
       Grass.
    */

    for (
        let i = 0;
        i < 900;
        i++
    ) {

        const x =
            (i * 97) %
            world.width;

        const y =
            (i * 151) %
            world.height;


        ctx.fillStyle =
            i % 2
                ? "#607451"
                : "#4b6047";


        ctx.fillRect(
            x,
            y,
            3,
            8
        );
    }


    /*
       Roads.
    */

    ctx.fillStyle =
        "#74716a";

    ctx.fillRect(
        100,
        1300,
        4100,
        160
    );

    ctx.fillRect(
        1850,
        100,
        180,
        2700
    );


    /*
       Water.
    */

    ctx.fillStyle =
        "#304e5d";

    ctx.fillRect(
        0,
        2620,
        world.width,
        380
    );


    for (
        const decoration
        of world.decorations
    ) {

        if (
            decoration.type ===
            "building"
        ) {

            ctx.fillStyle =
                "#292f2d";

            ctx.fillRect(
                decoration.x,
                decoration.y,
                decoration.width,
                decoration.height
            );


            ctx.fillStyle =
                "#454c48";

            ctx.fillRect(
                decoration.x + 30,
                decoration.y + 30,
                decoration.width - 60,
                55
            );
        }


        if (
            decoration.type ===
            "tree"
        ) {

            tree(
                decoration.x,
                decoration.y,
                decoration.size
            );
        }


        if (
            decoration.type ===
            "rock"
        ) {

            ctx.fillStyle =
                "#535956";

            ctx.beginPath();

            ctx.arc(
                decoration.x,
                decoration.y,
                decoration.size,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }


        if (
            decoration.type ===
            "dock"
        ) {

            ctx.fillStyle =
                "#705940";

            ctx.fillRect(
                decoration.x,
                decoration.y,
                40,
                210
            );
        }
    }


    drawWalls();
}


/* =====================================================
   WALLS
===================================================== */

function drawWalls() {

    for (
        const wall
        of world.walls
    ) {

        ctx.fillStyle =
            "#171a1c";

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        ctx.strokeStyle =
            "#555b60";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );
    }
}


/* =====================================================
   FURNITURE
===================================================== */

function drawFurniture() {

    for (
        const f
        of world.furniture
    ) {

        if (
            f.type === "sofa"
        ) {

            ctx.fillStyle =
                "#464b4e";

            ctx.fillRect(
                f.x,
                f.y,
                f.width,
                f.height
            );

            ctx.fillStyle =
                "#606568";

            ctx.fillRect(
                f.x + 12,
                f.y + 10,
                f.width - 24,
                32
            );

        }

        else if (
            f.type === "bed"
        ) {

            ctx.fillStyle =
                "#474f53";

            ctx.fillRect(
                f.x,
                f.y,
                f.width,
                f.height
            );

            ctx.fillStyle =
                "#999b9d";

            ctx.fillRect(
                f.x + 8,
                f.y + 8,
                f.width - 16,
                35
            );

        }

        else {

            ctx.fillStyle =
                "#594a3c";

            ctx.fillRect(
                f.x,
                f.y,
                f.width,
                f.height
            );

            ctx.fillStyle =
                "#342c26";

            ctx.fillRect(
                f.x + 10,
                f.y + 10,
                f.width - 20,
                f.height - 20
            );
        }
    }
}


/* =====================================================
   OBJECTS
===================================================== */

function drawObjects() {

    for (
        const object
        of world.objects
    ) {

        if (object.used) {
            continue;
        }


        ctx.fillStyle =

            object.keyObject
                ? "#a79b62"
                : "#665548";


        ctx.fillRect(
            object.x,
            object.y,
            object.width,
            object.height
        );


        ctx.strokeStyle =
            "#8a7c6d";

        ctx.strokeRect(
            object.x,
            object.y,
            object.width,
            object.height
        );


        if (
            object.keyObject
        ) {

            ctx.fillStyle =
                "#e0d18a";


            ctx.beginPath();

            ctx.arc(
                object.x + 25,
                object.y + 30,
                10,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillRect(
                object.x + 33,
                object.y + 27,
                27,
                6
            );
        }
    }
}


/* =====================================================
   EXIT
===================================================== */

function drawExit() {

    const e =
        world.exit;


    ctx.fillStyle =

        item
            ? "#607b65"
            : "#3b4144";


    ctx.fillRect(
        e.x,
        e.y,
        e.width,
        e.height
    );


    ctx.strokeStyle =

        item
            ? "#b7d1ba"
            : "#686f74";


    ctx.lineWidth = 4;


    ctx.strokeRect(
        e.x,
        e.y,
        e.width,
        e.height
    );


    ctx.fillStyle =
        "#e5e7e8";


    ctx.font =
        "bold 13px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(

        level === 1
            ? "MAIN EXIT"
            : "EXTRACTION BOAT",

        e.x +
        e.width / 2,

        e.y +
        e.height / 2 +
        5
    );


    ctx.textAlign =
        "left";
}


/* =====================================================
   PLAYER
===================================================== */

function drawPlayer() {

    const bob =
        player.moving
            ? Math.sin(
                player.animation
            ) * 3
            : 0;


    ctx.save();


    ctx.translate(
        player.x,
        player.y + bob
    );


    /*
       Shadow.
    */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";


    ctx.beginPath();

    ctx.ellipse(
        0,
        25,
        25,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Legs.
    */

    const leg =
        player.moving
            ? Math.sin(
                player.animation
            ) * 7
            : 0;


    ctx.strokeStyle =
        "#202428";

    ctx.lineWidth = 7;

    ctx.lineCap =
        "round";


    ctx.beginPath();

    ctx.moveTo(
        -7,
        9
    );

    ctx.lineTo(
        -7 + leg,
        25
    );


    ctx.moveTo(
        7,
        9
    );

    ctx.lineTo(
        7 - leg,
        25
    );

    ctx.stroke();


    /*
       Body.
    */

    ctx.fillStyle =
        "#687680";


    ctx.fillRect(
        -12,
        -10,
        24,
        23
    );


    /*
       Head.
    */

    ctx.fillStyle =
        "#bba99a";


    ctx.beginPath();

    ctx.arc(
        0,
        -24,
        12,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Hair.
    */

    ctx.fillStyle =
        "#24282a";


    ctx.beginPath();

    ctx.arc(
        0,
        -27,
        12,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Direction.
    */

    ctx.strokeStyle =
        "#e3e7e9";

    ctx.lineWidth = 3;


    ctx.beginPath();

    ctx.moveTo(
        0,
        -24
    );

    ctx.lineTo(

        Math.cos(
            player.facing
        ) * 21,

        -24 +
        Math.sin(
            player.facing
        ) * 21
    );

    ctx.stroke();


    ctx.restore();
}


/* =====================================================
   HUNTER
===================================================== */

function drawHunter() {

    const bob =
        Math.sin(
            hunter.animation
        ) * 3;


    ctx.save();


    ctx.translate(
        hunter.x,
        hunter.y + bob
    );


    /*
       Shadow.
    */

    ctx.fillStyle =
        "rgba(0,0,0,.5)";


    ctx.beginPath();

    ctx.ellipse(
        0,
        30,
        30,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Body.
    */

    ctx.fillStyle =
        "#171c20";


    ctx.beginPath();

    ctx.moveTo(
        -18,
        28
    );

    ctx.lineTo(
        -17,
        -5
    );

    ctx.lineTo(
        0,
        -19
    );

    ctx.lineTo(
        17,
        -5
    );

    ctx.lineTo(
        18,
        28
    );

    ctx.closePath();

    ctx.fill();


    /*
       Head.
    */

    ctx.fillStyle =
        "#787e81";


    ctx.beginPath();

    ctx.arc(
        0,
        -26,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Hood.
    */

    ctx.strokeStyle =
        "#0d1012";

    ctx.lineWidth = 7;


    ctx.beginPath();

    ctx.arc(
        0,
        -26,
        18,
        Math.PI,
        Math.PI * 2
    );

    ctx.stroke();


    /*
       Eyes.
    */

    ctx.fillStyle =
        "#e0e3e4";


    ctx.fillRect(
        -8,
        -29,
        5,
        3
    );

    ctx.fillRect(
        3,
        -29,
        5,
        3
    );


    /*
       Arms.
    */

    const arm =
        Math.sin(
            hunter.animation
        ) * 5;


    ctx.strokeStyle =
        "#171b1e";

    ctx.lineWidth = 7;


    ctx.beginPath();

    ctx.moveTo(
        -14,
        -1
    );

    ctx.lineTo(
        -23,
        16 + arm
    );


    ctx.moveTo(
        14,
        -1
    );

    ctx.lineTo(
        23,
        16 - arm
    );

    ctx.stroke();


    ctx.restore();
}


/* =====================================================
   DECOR
===================================================== */

function rug(
    x,
    y,
    width,
    height
) {

    ctx.fillStyle =
        "#24282a";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    ctx.strokeStyle =
        "#696e71";

    ctx.lineWidth = 5;


    ctx.strokeRect(
        x + 8,
        y + 8,
        width - 16,
        height - 16
    );
}


function lamp(
    x,
    y
) {

    ctx.fillStyle =
        "#b9ae84";


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function tree(
    x,
    y,
    size
) {

    ctx.fillStyle =
        "#403a31";


    ctx.fillRect(
        x - 6,
        y,
        12,
        size * 1.5
    );


    ctx.fillStyle =
        "#29412d";


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        size,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#365238";


    ctx.beginPath();

    ctx.arc(
        x - size * .4,
        y + 5,
        size * .65,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        x + size * .4,
        y + 5,
        size * .6,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =====================================================
   PARTICLES
===================================================== */

function drawParticles() {

    for (
        const particle
        of world.particles
    ) {

        particle.y -= .3;


        if (
            particle.y < 0
        ) {

            particle.y =
                world.height;
        }


        ctx.fillStyle =
            `rgba(220,225,230,${particle.alpha})`;


        ctx.fillRect(
            particle.x,
            particle.y,
            particle.size,
            particle.size
        );
    }
}


/* =====================================================
   LIGHTING
===================================================== */

function drawLighting() {

    const px =
        player.x -
        camera.x;

    const py =
        player.y -
        camera.y;


    const radius =
        level === 1
            ? 430
            : 350;


    const gradient =
        ctx.createRadialGradient(

            px,
            py,
            70,

            px,
            py,
            radius
        );


    gradient.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    gradient.addColorStop(
        .55,
        "rgba(0,0,0,.18)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,.68)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );
}


/* =====================================================
   PROMPT
===================================================== */

function updatePrompt() {

    let nearest = null;

    let nearestDistance =
        Infinity;


    for (
        const object
        of world.objects
    ) {

        if (object.used) {
            continue;
        }


        const distance =
            Math.hypot(

                player.x -
                object.x,

                player.y -
                object.y
            );


        if (
            distance < 125 &&
            distance <
            nearestDistance
        ) {

            nearest =
                object;

            nearestDistance =
                distance;
        }
    }


    if (nearest) {

        prompt.textContent =
            `E — SEARCH ${nearest.name.toUpperCase()}`;

        prompt.classList.add(
            "show"
        );

    } else {

        prompt.classList.remove(
            "show"
        );
    }
}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    levelUI.textContent =
        level;


    healthUI.textContent =
        Math.ceil(
            player.health
        );


    staminaUI.style.width =
        player.stamina + "%";


    itemUI.textContent =
        item || "NONE";


    objectiveUI.textContent =

        level === 1

            ? item
                ? "REACH THE MAIN EXIT"
                : "SEARCH THE MANSION"

            : item
                ? "REACH THE BOAT"
                : "FIND THE DOCK KEY";


    const seconds =
        Math.floor(elapsed);


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    timerUI.textContent =

        String(minutes)
            .padStart(2, "0")

        +

        ":" +

        String(remaining)
            .padStart(2, "0");
}


/* =====================================================
   MESSAGE
===================================================== */

let messageTimer = null;


function showMessage(
    text,
    duration
) {

    message.textContent =
        text;


    message.classList.add(
        "show"
    );


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(() => {

            message.classList.remove(
                "show"
            );

        }, duration);
}


/* =====================================================
   END
===================================================== */

function winGame() {

    playing = false;

    game.classList.add(
        "hidden"
    );

    end.classList.remove(
        "hidden"
    );


    endTitle.textContent =
        "ESCAPED";


    endText.textContent =
        "You reached the extraction point and escaped.";


    finalTime.textContent =
        formatTime(elapsed);


    finalLevel.textContent =
        level;
}


function loseGame() {

    playing = false;

    game.classList.add(
        "hidden"
    );

    end.classList.remove(
        "hidden"
    );


    endTitle.textContent =
        "CAUGHT";


    endText.textContent =
        "The Hunter caught you. Try again.";


    finalTime.textContent =
        formatTime(elapsed);


    finalLevel.textContent =
        level;
}


function formatTime(
    seconds
) {

    const s =
        Math.floor(seconds);


    return (

        String(
            Math.floor(
                s / 60
            )
        ).padStart(2, "0")

        +

        ":" +

        String(
            s % 60
        ).padStart(2, "0")
    );
}


/* =====================================================
   MOBILE
===================================================== */

const joystick = {

    x: 0,
    y: 0
};

let joystickActive = false;

let mobileRunning = false;


function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystickElement
            .getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    let dx =
        clientX -
        centerX;


    let dy =
        clientY -
        centerY;


    const max = 45;


    const distance =
        Math.hypot(
            dx,
            dy
        );


    if (
        distance > max
    ) {

        dx =
            dx /
            distance *
            max;


        dy =
            dy /
            distance *
            max;
    }


    joystick.x =
        dx / max;


    joystick.y =
        dy / max;


    knob.style.transform =
        `translate(${dx}px, ${dy}px)`;
}


function resetJoystick() {

    joystickActive = false;

    joystick.x = 0;
    joystick.y = 0;

    knob.style.transform =
        "translate(0,0)";
}


joystickElement.addEventListener(
    "pointerdown",
    event => {

        joystickActive = true;

        joystickElement.setPointerCapture(
            event.pointerId
        );

        updateJoystick(
            event.clientX,
            event.clientY
        );
    }
);


joystickElement.addEventListener(
    "pointermove",
    event => {

        if (
            joystickActive
        ) {

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    }
);


joystickElement.addEventListener(
    "pointerup",
    resetJoystick
);


joystickElement.addEventListener(
    "pointercancel",
    resetJoystick
);


interactButton.addEventListener(
    "pointerdown",
    interact
);


runButton.addEventListener(
    "pointerdown",
    () => {

        mobileRunning = true;
    }
);


runButton.addEventListener(
    "pointerup",
    () => {

        mobileRunning = false;
    }
);


runButton.addEventListener(
    "pointercancel",
    () => {

        mobileRunning = false;
    }
);


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(now) {

    if (!playing) {
        return;
    }


    const dt =
        Math.min(
            (now -
                lastFrame) /
            1000,

            .033
        );


    lastFrame =
        now;


    elapsed =
        (
            performance.now() -
            startTime
        ) / 1000;


    updatePlayer(dt);

    updateHunter(dt);

    checkExit();

    updateCamera(dt);

    updatePrompt();

    updateHUD();


    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    drawWorld();


    requestAnimationFrame(
        gameLoop
    );
}
