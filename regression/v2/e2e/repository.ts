// Simple object repository
export default class Repository {
  private entities: object[] = [];

  fetchAll() {
    return this.entities;
  }

  getById(id) {
    return this.entities.find(
      (entity: { id: unknown }) => Number(id) === Number(entity.id),
    );
  }

  insert(entity) {
    this.entities.push(entity);
  }

  clear() {
    this.entities = [];
  }
}
