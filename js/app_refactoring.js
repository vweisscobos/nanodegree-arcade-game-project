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