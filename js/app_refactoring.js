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