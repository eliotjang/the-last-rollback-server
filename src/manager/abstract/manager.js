class Manager {
  constructor() {
    if (new.target === Manager) {
      throw new TypeError('Cannot instantiate abstract class');
    }
  }

  add(id, ...args) {
    throw new Error('Method not implemented.');
  }

  remove(id, ...args) {
    throw new Error('Method not implemented.');
  }

  clearAll() {
    throw new Error('Method not implemented.');
  }
}

export default Manager;
