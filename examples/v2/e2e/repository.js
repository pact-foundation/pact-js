// Simple object repository
class Repository {
  constructor() {
    this.entities = [];
  }

  fetchAll() {
    return this.entities;
  }

  getById(id) {
    return this.entities.find((entity) => Number(id) === Number(entity.id));
  }

  insert(entity) {
    this.entities.push(entity);
  }

  clear() {
    this.entities = [];
  }
}

module.exports = Repository;
