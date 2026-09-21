* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #050607;
    color: white;
    font-family: Arial, sans-serif;
}

.hidden {
    display: none !important;
}

button {
    cursor: pointer;
}


/* =========================
   MENU
========================= */

#menu,
#end {
    position: fixed;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    background:
        radial-gradient(
            circle at center,
            #30363b 0%,
            #101316 45%,
            #030405 100%
        );

    z-index: 100;
}

.menu-card,
.end-card {
    width: min(650px, 90%);
    padding: 45px;

    background: rgba(7, 9, 11, .96);

    border: 1px solid #4b5258;

    box-shadow:
        0 30px 100px rgba(0,0,0,.8);

    text-align: center;
}

.studio {
    font-size: 10px;
    letter-spacing: 6px;
    color: #929ba3;
    margin-bottom: 25px;
}

h1 {
    font-size: clamp(65px, 12vw, 115px);
    line-height: .78;
    letter-spacing: 8px;
}

h1 span {
    color: #8b969f;
}

.tagline {
    margin-top: 25px;

    color: #68727a;

    font-size: 11px;
    letter-spacing: 5px;
}

.mission {
    text-align: left;

    margin: 35px 0;

    padding: 20px;

    border-left: 3px solid #aeb6bc;

    background: rgba(255,255,255,.035);
}

.mission b {
    font-size: 9px;
    letter-spacing: 3px;
}

.mission p {
    margin-top: 8px;

    color: #929aa1;

    line-height: 1.6;
}

#startButton,
#restart {
    width: 100%;

    padding: 18px;

    background: #e5e9ec;

    color: #080a0c;

    border: none;

    font-weight: bold;

    letter-spacing: 3px;

    transition: .15s;
}

#startButton:hover,
#restart:hover {
    background: white;
    transform: translateY(-2px);
}

.controls {
    margin-top: 25px;

    display: flex;
    justify-content: center;
    gap: 25px;

    color: #606970;

    font-size: 9px;
    letter-spacing: 1px;
}

.controls b {
    color: #dce0e3;
}


/* =========================
   GAME
========================= */

#game {
    position: fixed;
    inset: 0;
}

#canvas {
    position: absolute;

    left: 0;
    top: 0;

    width: 100%;
    height: 100%;
}


/* =========================
   HUD
========================= */

#hud {
    position: absolute;

    left: 18px;
    right: 18px;
    top: 18px;

    display: flex;
    justify-content: space-between;

    pointer-events: none;
}

.hud-left,
.hud-right {
    display: flex;
    gap: 8px;
}

.hud-box {
    padding: 9px 13px;

    min-width: 75px;

    background: rgba(4,6,8,.85);

    border: 1px solid rgba(255,255,255,.14);

    backdrop-filter: blur(8px);
}

.hud-box small {
    display: block;

    color: #68727b;

    font-size: 8px;

    letter-spacing: 2px;

    margin-bottom: 5px;
}

.hud-box strong {
    font-size: 13px;
}

.objective {
    min-width: 230px;
}

.stamina {
    width: 80px;
    height: 7px;

    background: #252a2e;
}

#stamina {
    width: 100%;
    height: 100%;

    background: #dce2e6;
}


/* =========================
   WARNING
========================= */

#warning {
    position: absolute;

    top: 105px;
    left: 50%;

    transform: translateX(-50%);

    padding: 11px 22px;

    background: rgba(70,20,20,.9);

    border: 1px solid #784848;

    font-size: 10px;

    letter-spacing: 3px;

    opacity: 0;

    transition: .2s;
}

#warning.show {
    opacity: 1;
}


/* =========================
   PROMPT
========================= */

#prompt {
    position: absolute;

    bottom: 80px;
    left: 50%;

    transform: translateX(-50%);

    padding: 12px 22px;

    background: rgba(0,0,0,.85);

    border: 1px solid rgba(255,255,255,.2);

    font-size: 11px;

    letter-spacing: 2px;

    opacity: 0;
}

#prompt.show {
    opacity: 1;
}


/* =========================
   MESSAGE
========================= */

#message {
    position: absolute;

    bottom: 30px;
    left: 50%;

    transform: translateX(-50%);

    padding: 12px 25px;

    background: rgba(0,0,0,.85);

    border: 1px solid rgba(255,255,255,.15);

    font-size: 12px;

    opacity: 0;
}

#message.show {
    opacity: 1;
}


/* =========================
   WATERMARK
========================= */

.watermark {
    position: absolute;

    right: 18px;
    bottom: 14px;

    color: rgba(255,255,255,.28);

    font-size: 9px;

    letter-spacing: 4px;
}


/* =========================
   END
========================= */

.end-card h2 {
    font-size: clamp(55px, 11vw, 105px);

    letter-spacing: 7px;
}

.end-card p {
    margin: 25px 0;

    color: #929aa1;

    line-height: 1.6;
}

.results {
    display: flex;

    justify-content: center;

    gap: 70px;

    margin-bottom: 30px;
}

.results small {
    display: block;

    color: #68727b;

    font-size: 8px;

    letter-spacing: 3px;

    margin-bottom: 5px;
}

.results b {
    font-size: 21px;
}


/* =========================
   MOBILE
========================= */

#mobile {
    display: none;

    position: absolute;

    inset: 0;

    pointer-events: none;
}

#joystick {
    position: absolute;

    left: 25px;
    bottom: 25px;

    width: 140px;
    height: 140px;

    border-radius: 50%;

    background: rgba(0,0,0,.35);

    border: 2px solid rgba(255,255,255,.18);

    pointer-events: auto;
}

#knob {
    position: absolute;

    left: 43px;
    top: 43px;

    width: 50px;
    height: 50px;

    border-radius: 50%;

    background: rgba(255,255,255,.3);
}

#runButton,
#interactButton {
    position: absolute;

    border-radius: 50%;

    color: white;

    background: rgba(0,0,0,.55);

    border: 1px solid rgba(255,255,255,.25);

    pointer-events: auto;
}

#runButton {
    right: 25px;
    bottom: 25px;

    width: 90px;
    height: 90px;
}

#interactButton {
    right: 135px;
    bottom: 85px;

    width: 60px;
    height: 60px;
}


@media (pointer: coarse) {

    #mobile {
        display: block;
    }

    .hud-right {
        display: none;
    }

    .controls {
        display: none;
    }

    #hud {
        left: 10px;
        top: 10px;
    }

    .objective {
        min-width: 180px;
    }
}
