//  initialize all shared constants
const NUMBER_OF_ENEMIES = 8;
const AVAILABLE_TIME = 150;
const COLUMN_WIDTH = 101;
const LINE_HEIGHT = 83;
const HEIGHT_AJUST = 53; // fix the difference between the entities and the ground blocks vertical position
const NUM_OF_ENEMY_LANES = 4;
const NUM_OF_ENEMY_COLUMNS = 5;

//  initialize all shared variables
let enemySpeedMultiplier = 2;
let isEnemySpeedReduced = false;
let crosses = 0;

//  initialize all the entities and listeners
const htmlChooseCharPopup = document.getElementsByClassName('choose-char-popup')[0];
const htmlGameOverPopup = document.getElementsByClassName('game-over-popup')[0];
const htmlPlayAgainBtn = document.getElementsByClassName('play-again-btn')[0];
const htmlScoreDisplay = document.getElementsByClassName('score-display')[0];
const score = Score();
const messages = Messages();
const timeout = Timeout(AVAILABLE_TIME);
const gems = Gems();
const allEnemies = Array.apply(
  null,
  {length: NUMBER_OF_ENEMIES}).map(() => Enemy()
);
const player = Player();

htmlChooseCharPopup.addEventListener('click', e => {
  //  once a char is selected, the engine and the timeout are initialized
  player.setChar(e.target.value);
  hideCharSelector();
  Engine.init();
  timeout.reset();
});

htmlPlayAgainBtn.addEventListener('click', init);

init();

function init() {
  enemySpeedMultiplier = 2;
  showCharSelector();
  hideGameOverPopup();
  score.reset();

  //  Add event listener to handle the keyboard input
  document.addEventListener('keyup', player.handleInput);
}

function setScoreDisplay() {
  if (score.getCrosses() > 0) {
    htmlScoreDisplay.innerText = 'You scored ' + score.getCrosses() + ' crosses';
  } else {
    htmlScoreDisplay.innerText = 'You loose';
  }
}

function showCharSelector() {
  htmlChooseCharPopup.style.visibility = 'visible';
}

function hideCharSelector() {
  htmlChooseCharPopup.style.visibility = 'hidden';
}

function showGameOverPopup() {
  htmlGameOverPopup.style.visibility = 'visible';
}

function hideGameOverPopup() {
  htmlGameOverPopup.style.visibility = 'hidden';
}

function onCrossCompleted() {
  score.increaseCrosses();
  messages.newMessage('AWESOME', 125, 50);
}

function gameOver() {
  document.removeEventListener('keyup', player.handleInput);
  showGameOverPopup();
  setScoreDisplay();
  timeout.stop();
}

function reduceEnemySpeed() {
  isEnemySpeedReduced = true;

  setTimeout(() => {
    isEnemySpeedReduced = false;
  }, 5000);
}

function addTimeToTimeout() {
  timeout.increaseTimeout(30);
}

function Gems() {
  const POSSIBLE_GEMS = ['Blue','Green'];
  const MAX_DELAY = 15000;  //  Maximum waiting time until the next gem appear on the screan
  const MIN_DELAY = 3001; // Minimum waiting time until the next gem appear on the screan

  let availableGem = {};
  let delayToNewGem = 5000;
  let lastGemAdded = Date.now();

  const randomX = () => COLUMN_WIDTH * Math.floor(Math.random() * NUM_OF_ENEMY_COLUMNS);
  const randomY = () => HEIGHT_AJUST + LINE_HEIGHT * (Math.ceil(Math.random() * NUM_OF_ENEMY_LANES) - 1);
  const randomGem = () => POSSIBLE_GEMS[Math.floor(Math.random() * POSSIBLE_GEMS.length)];
  const randomInterval = () => Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;

  const newGem = () => {
    availableGem = {
      type: randomGem(),
      addedTime: Date.now(),
      x: randomX(),
      y: randomY()
    };

    lastGemAdded = Date.now();
  };

  const getGemCoordinates = () => { return { x, y } = availableGem };

  const gemCollected = () => {
    let gemType = availableGem.type;
    availableGem = {};

    applyGemEffect(gemType);
  };

  const applyGemEffect = (gemType) => {
    switch (gemType) {
      case 'Blue':
        reduceEnemySpeed();
        break;
      case 'Green':
        addTimeToTimeout();
        break;
      default:
        break;
    }
  };

  const update = () => {
    if (availableGem.type && Date.now() - availableGem.addedTime > 3000) {
      availableGem = {};
      delayToNewGem = randomInterval();
    }

    if (Date.now() - lastGemAdded > delayToNewGem) newGem();
  };

  const render = () => {
    if (availableGem.type) {
      ctx.drawImage(Resources.get('images/Gem ' + availableGem.type + '.png'), availableGem.x, availableGem.y);
    }
  };

  return {
    update,
    render,
    getGemCoordinates,
    gemCollected
  }
}

function Messages() {
  const sprites = new Map([['OUCH', 'images/Ouch.png'],['AWESOME', 'images/Awesome.png']]);
  const messages = [];

  const newMessage = (type, x, y) => {
    messages.push({type, x, y, time: Date.now()});
  };

  const update = () => {
    let messagesToRemove = 0;

    messages.forEach(msg => {
      if (Date.now() - msg.time >  500) messagesToRemove++;
    });

    removeOldMessages(messagesToRemove)
  };

  const removeOldMessages = (qnt) => {
    for (let i = 0; i < qnt; i++) {
      messages.shift();
    }
  };

  const render = () => {
    messages.forEach(msg => {
      ctx.drawImage(Resources.get(sprites.get(msg.type)), msg.x, msg.y);
    });
  };

  return {
    newMessage,
    update,
    render
  }
}

function Timeout(availableTime) {
  let timeOut;
  let remainingTime = availableTime;

  const init = () => {
    timeOut = setInterval(decreaseTimeout, 1000);
  };

  const stop = () => {
    clearInterval(timeOut);
  };

  const reset = () => {
    remainingTime = availableTime;
    init();
  };

  const decreaseTimeout = () => {
    remainingTime--;
    if (remainingTime === 0) {
      stop();
      gameOver();
    }
  };

  const increaseTimeout = (seconds) => {
    remainingTime += seconds;
  };

  const render = () => {
    ctx.font = "normal 20px verdana, sans-serif";
    ctx.fillStyle = "#666666";
    ctx.fillText(getFormattedTime() + "", 20, 20);
  };

  const getFormattedTime = () => {
    let min = Math.floor(remainingTime/60);
    let sec = remainingTime%60;

    min = min >= 10 ? min : '0' + min;
    sec = sec >= 10 ? sec : '0' + sec;

    return min + ":" + sec;
  };

  return {
    init,
    render,
    increaseTimeout,
    stop,
    reset
  }
}

function Score() {
  let crosses = 0;

  const increaseCrosses = () => {
    crosses++;
    if (!isEnemySpeedReduced) {
      enemySpeedMultiplier += 0.5;
    }
  };

  const decreaseCrosses = () => {
    if (crosses - 1 < 0) {
      gameOver();
      return;
    }
    else crosses--;
    if (!isEnemySpeedReduced) {
      enemySpeedMultiplier -= 0.5;
    }
  };

  const update = () => {};

  const render = () => {
    ctx.font = "normal 20px verdana, sans-serif";
    ctx.fillStyle = '#666666';
    ctx.fillText('score: ' + crosses, 400, 20);
  };

  const getCrosses = () => crosses;

  const reset = () => {
    crosses = 0;
  };

  return {
    render,
    decreaseCrosses,
    update,
    increaseCrosses,
    getCrosses,
    reset
  }
}

function Enemy() {
  const sprite = 'images/enemy-bug.png';
  let x;
  let y;
  let speed;
  let width = 101;

  const getX = () => x;
  const getY = () => y;
  const getWidth = () => width;

  //  Place the enemy at a random row and in a random column
  const randomPosition = (initialPosition = false) => {
    if (initialPosition) x = COLUMN_WIDTH * Math.floor(Math.random() * 5);
    else x = -COLUMN_WIDTH * Math.ceil(Math.random() * 3);
    y = HEIGHT_AJUST + LINE_HEIGHT * (Math.ceil(Math.random()*4) - 1);
  };

  //  Set a random speed based on the number of completed crosses
  const randomSpeed = () => {
    let newSpeed = Math.random() * enemySpeedMultiplier;
    speed = newSpeed < 1 ? 1 : newSpeed;
  };

  const reset = () => {
    randomPosition();
    randomSpeed();
  };

  const init = () => {
    randomPosition(true);
    randomSpeed();
  };

  const update = (dt) => {
    if (dt < 0.01) return;
    x += (isEnemySpeedReduced ? 0.5 : speed);
    if (x > 6 * 101) reset();
  };

  const render = () => {
    ctx.drawImage(Resources.get(sprite), x, y);
  };

  init();

  return {
    render,
    update,
    getX,
    getY,
    getWidth
  }
}

function Player() {
  let sprite = null;
  let x;
  let y;
  const width = COLUMN_WIDTH;
  const WIDTH_AJUST = 30; //  fix the empty space between the char and the png canvas border

  const getX = () => x;
  const getY = () => y;

  const update = () => {
    if (y <= 0) {
      reset();
      onCrossCompleted();
    }
  };

  const setChar = (char) => {
    sprite = 'images/char-' + char + '.png';
  };

  const render = () => {
    ctx.drawImage(Resources.get(sprite), x, y);
  };

  const moveLeft = () => {
    if (x - COLUMN_WIDTH >= 0) x -= COLUMN_WIDTH;
  };

  const moveRight = () => {
    if (x + COLUMN_WIDTH < COLUMN_WIDTH * NUM_OF_ENEMY_COLUMNS) x += COLUMN_WIDTH;
  };

  const moveUp = () => {
    y -= LINE_HEIGHT;
  };

  const moveDown = () => {
    if (y + LINE_HEIGHT < HEIGHT_AJUST + LINE_HEIGHT * (NUM_OF_ENEMY_LANES + 1)) y += LINE_HEIGHT;
  };

  const handleInput = (evt) => {
    switch(evt.code) {
      case 'ArrowLeft':
        moveLeft();
        break;
      case 'ArrowRight':
        moveRight();
        break;
      case 'ArrowUp':
        moveUp();
        break;
      case 'ArrowDown':
        moveDown();
        break;
      default:
        break;
    }
  };

  const checkCollision = (entity) => {
    if ((x + width - WIDTH_AJUST > entity.getX() + entity.getWidth() && x + WIDTH_AJUST < entity.getX() + entity.getWidth())
      || (x + WIDTH_AJUST < entity.getX() && x + width - WIDTH_AJUST > entity.getX())
      || (x + WIDTH_AJUST > entity.getX() && x + width - WIDTH_AJUST < entity.getX() + entity.getWidth()))
      return true
  };

  const reset = () => {
    y = HEIGHT_AJUST + LINE_HEIGHT * 4;
    x = COLUMN_WIDTH * 2;
  };

  reset();

  return {
    render,
    update,
    handleInput,
    reset,
    setChar,
    checkCollision,
    getX,
    getY
  }
}





