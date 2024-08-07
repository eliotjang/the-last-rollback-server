import Manager from './abstract/manager.js';

class IntervalManager extends Manager {
  constructor() {
    if (IntervalManager.instance) {
      return IntervalManager.instance;
    }
    super();
    this.intervals = new Map();
    IntervalManager.instance = this;
  }

  static getInstance() {
    if (!IntervalManager.instance) {
      IntervalManager.instance = new IntervalManager();
    }
    return IntervalManager.instance;
  }

  add(id, callback, interval, type = 'none') {
    if (!this.intervals.has(id)) {
      this.intervals.set(id, new Map());
    }
    this.intervals.get(id).set(type, setInterval(callback, interval));
  }

  remove(id, type) {
    try {
      if (this.intervals.has(id)) {
        const curIntervals = this.intervals.get(id);
        if (typeof type === 'undefined' || type === null) {
          Promise.all(
            curIntervals.map(async (intervalId) => {
              clearInterval(intervalId);
            }),
          ).then(() => {
            this.intervals.delete(type);
            return;
          });
        } else {
          if (curIntervals.has(type)) {
            clearInterval(curIntervals.get(type));
            curIntervals.delete(type);
          }
        }
        return;
      }
      throw new Error(`Error on IntervalManager: Could not find intervals with id ${id}`);
    } catch (err) {
      console.error(err);
    }
  }

  clearAll() {
    Object.keys(this.intervals).forEach(async (id) => {
      this.remove(id);
    });
  }
}

export default IntervalManager;
