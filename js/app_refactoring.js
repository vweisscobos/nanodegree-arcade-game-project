/*
 * An observer to centralize the handling of game events
 */
class GameObserver {
  constructor() {
    this.subscribers = [];
  }

  publish(event, data) {
    this.subscribers.filter(subs => {
      return subs[0] === event;
    }).forEach(subs => {
      subs[1](data);
    });
  }

  subscribe(event, func) {
    if (typeof event !== 'string') return;

    this.subscribers.push([event, func]);
  }
}

/* Messages class provides the feature to display messages in the canvas and
 * is also responsible to remove then after a while.
 */
class Messages {

  constructor() {
    this.messages = [];
  }

  newMessage(type, x, y) {
    this.messages.push({type, x, y, time: Date.now()});
  };

  //  remove messages which are visible for more than 0.5s
  update() {
    let messagesToRemove = 0;

    this.messages.forEach(msg => {
      if (Date.now() - msg.time >  500) messagesToRemove++;
    });

    this.removeOldMessages(messagesToRemove)
  };

  removeOldMessages(qnt) {
    for (let i = 0; i < qnt; i++) {
      this.messages.shift();
    }
  };

  render() {
    this.messages.forEach(msg => {
      GLOBALS.ctx.drawImage(
        Resources.get(GLOBALS.messageSprites.get(msg.type)),
        msg.x,
        msg.y
      );
    });
  };
}

/* Gems class is responsible for create the collectible gems and place them
 * in the canvas. It also apply some effect to the game depending on the type
 * and if a gem is collected. If a gem is not collected, the Gem class remove
 * it from the canvas after a while.
 */
class Gems {

  constructor() {
    this.availableGem = {};
    this.delayToNewGem = 5000;
    this.lastAddedGem = Date.now();
  }

  //  generate a random horizontal position to place the gem
  static randomX() {
    return GLOBALS.columnWidth * Math.floor(Math.random() * GLOBALS.numOfEnemyColumns);
  };

  //  generate a random vertical position to place the gem
  static randomY() {
    return GLOBALS.heightAjust + GLOBALS.lineHeight * (Math.ceil(Math.random() * GLOBALS.numOfEnemyLanes) - 1);
  };

  //  return type of gem randomly
  static randomGem() {
    return GLOBALS.possibleGems[Math.floor(Math.random() * GLOBALS.possibleGems.length)];
  }

  //  return a random interval in milliseconds
  static randomInterval() {
    return Math.random() * (GLOBALS.maxDelayToNewGem - GLOBALS.minDelayToNewGem) + GLOBALS.minDelayToNewGem;
  };

  //  apply gem effect to the game
  static applyGemEffect(gemType) {
    switch (gemType) {
      case 'Blue':
        GLOBALS.observer.publish(GLOBALS.eventTypes.BLUE_GEM_COLLECTED);
        break;
      case 'Green':
        GLOBALS.observer.publish(GLOBALS.eventTypes.GREEN_GEM_COLLECTED);
        break;
      default:
        break;
    }
  };

  //  add a new gem to available gem and update last added gem time
  newGem() {
    this.availableGem = {
      type: Gems.randomGem(),
      addedTime: Date.now(),
      x: Gems.randomX(),
      y: Gems.randomY()
    };

    this.lastAddedGem = Date.now();
  };

  getGemCoordinates() {
    return {
      x: this.availableGem.x,
      y: this.availableGem.y
    };
  };

  //  check type of collected gem and apply gem effect
  gemCollected() {
    let gemType = this.availableGem.type;
    this.availableGem = {};

    Gems.applyGemEffect(gemType);
  };

  update() {
    if (this.availableGem.type && Date.now() - this.availableGem.addedTime > 3000) {
      this.availableGem = {};
      this.delayToNewGem = Gems.randomInterval();
    }

    if (Date.now() - this.lastAddedGem > this.delayToNewGem) this.newGem();
  };

  render() {
    if (this.availableGem.type) {
      GLOBALS.ctx.drawImage(
        Resources.get('images/Gem ' + this.availableGem.type + '.png'),
        this.availableGem.x,
        this.availableGem.y
      );
    }
  };
}

/* Player class is responsible for all that concerns the char's moves and features.
 * It handles the collision logic and also the player's keyboard inputs.
 */
class Player {

  constructor() {
    this.sprite = 'images/char-' + 'boy' + '.png';
    this.x = 0;
    this.y = 0;
    this.reset();

    this.handleInput = this.handleInput.bind(this);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  update() {
    if (this.y <= 0) {
      this.reset();
      GLOBALS.observer.publish(GLOBALS.eventTypes.CROSS_COMPLETED);
    }
  };

  setChar(char) {
    this.sprite = 'images/char-' + char + '.png';
  };

  render() {
    GLOBALS.ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  };

  moveLeft() {
    if (this.x - GLOBALS.columnWidth >= 0) this.x -= GLOBALS.columnWidth;
  };

  moveRight() {
    if (this.x + GLOBALS.columnWidth <GLOBALS.columnWidth * GLOBALS.numOfEnemyColumns)
      this.x += GLOBALS.columnWidth;
  };

  moveUp() {
    this.y -= GLOBALS.lineHeight;
  };

  moveDown() {
    if (this.y + GLOBALS.lineHeight < GLOBALS.heightAjust + GLOBALS.lineHeight * (GLOBALS.numOfEnemyColumns + 1))
      this.y += GLOBALS.lineHeight;
  };

  handleInput(evt) {
    switch(evt.code) {
      case 'ArrowLeft':
        this.moveLeft();
        break;
      case 'ArrowRight':
        this.moveRight();
        break;
      case 'ArrowUp':
        this.moveUp();
        break;
      case 'ArrowDown':
        this.moveDown();
        break;
      default:
        break;
    }
  };

  /*
   * Return char's final x position taking into account
   * the empty space between the border of the png canvas and the char
   */
  getCorrectedFinalX() {
    return this.x + GLOBALS.columnWidth - GLOBALS.charWidthAjust;
  }

  /*
   * Return char's initial x position taking into account
   * the empty space between the border of the png canvas and the char
   */
  getCorrectedInitialX() {
    return this.x + GLOBALS.charWidthAjust;
  }

  checkCollision(entity) {
    if (entity.getY() !== this.y) {
      return;
    }

    //  if the char is between enemy boundaries, there is collision
    let isCharInsideEntity = this.getCorrectedFinalX() > entity.getX() + entity.getWidth()
      && this.getCorrectedInitialX() < entity.getX() + entity.getWidth();

    //  if char's right side is inside enemy boundaries, there is collision
    let isRightSideCollided = this.getCorrectedInitialX() < entity.getX() && this.getCorrectedFinalX() > entity.getX();

    //  if char's left side is inside enemy boundaries, there is collision
    let isLeftSideCollided = this.getCorrectedInitialX() > entity.getX()
      && this.getCorrectedFinalX() < entity.getX() + entity.getWidth();

    if (isCharInsideEntity || isRightSideCollided || isLeftSideCollided) return true
  };

  reset() {
    this.y = GLOBALS.heightAjust + GLOBALS.lineHeight * 4;
    this.x = GLOBALS.columnWidth * 2;
  };
}