
import { createShape } from "./shape.js";

// SETTINGS
const note = "C4";
const updateSpeed = 100;

// STATE
const pointer = {
  x: 0.5,
  y: 0.5,
  previousX: 0.5,
  previousY: 0.5,
  speed: 0,
  history: [],
  isMoving: false,
};

// SOUND
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

// SHAPE
let circle;

// UPDATE
function update() {
  const dx = pointer.x - pointer.previousX;
  const dy = pointer.y - pointer.previousY;

  pointer.speed = Math.sqrt(dx * dx + dy * dy);
  pointer.previousX = pointer.x;
  pointer.previousY = pointer.y;

  pointer.history.push({
    x: pointer.x,
    y: pointer.y,
    speed: pointer.speed,
  });

  if (pointer.history.length > 10) {
    pointer.history.shift();
  }

  setTimeout(update, updateSpeed);
}

// USE

let lastSoundTime = 0;

function use() {
  if (circle) {
    circle.setPosition(pointer.x, pointer.y);

    const size = 40 + Math.min(pointer.speed * 1500, 100);
    circle.setSize(size);

    const hue = Math.min(pointer.x * 360, 360);
    circle.setColour(hue, 100, 50);
  }

  // Play sound when the pointer is moving
  const now = Date.now();

  if (pointer.speed > 0.005 && now - lastSoundTime > 250) {
    const frequency = 220 + pointer.x * 660;
    const movingNote = Tone.Frequency(frequency).toNote();

    synth.triggerAttackRelease(movingNote, "8n");
    lastSoundTime = now;
  }

  setTimeout(use, updateSpeed);
}


// POINTER EVENT HANDLER
function pointerMove(event) {
  pointer.x = event.clientX / window.innerWidth;
  pointer.y = event.clientY / window.innerHeight;
  pointer.isMoving = true;
}

function pointerDown() {
  Tone.start();
  synth.triggerAttackRelease(note, "8n");
}

// SETUP
function setup() {
  circle = createShape("moving-circle");
  circle.setPosition(0.5, 0.5);
  circle.setSize(60);
  circle.setRoundedness(1);

  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerdown", pointerDown);

  update();
  use();
}

setup();
