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