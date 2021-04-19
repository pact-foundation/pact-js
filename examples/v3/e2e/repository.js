// Simple object repository
class Repository {
  constructor() {
    this.entities = [];
  }

  fetchAll() {
    return this.entities;
  }

  getById(id) {
    return this.entities.find((entity) => id == entity.id);
  }

  insert(entity) {
    this.entities.push(entity);
  }

  clear() {
    this.entities = [];
  }

  first() {
    return this.entities[0];
  }

  count() {
    return this.entities.length;
  }
}

module.exports = Repository;
