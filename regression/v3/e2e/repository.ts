// Simple object repository
export default class Repository {
  private entities: object[] = [];

  fetchAll() {
    return this.entities;
  }

  getById(id) {
    return this.entities.find(
      (entity: any) => Number(id) === Number(entity.id),
    );
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
