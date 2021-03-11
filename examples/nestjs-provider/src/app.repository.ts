import * as fs from "fs"
import * as path from "path"
import { Injectable } from "@nestjs/common"
import { Animal } from "./animal.interface"

@Injectable()
export class AppRepository {
  private entities: Animal[]

  public constructor() {
    this.entities = []
    this.importData()
  }

  public importData(): void {
    const data = (fs.readFileSync(
      path.resolve("./data/animal-data.json"),
      "utf-8"
    ) as unknown) as string

    JSON.parse(data).reduce((animal, value) => {
      value.id = animal + 1
      this.insert(value)
      return animal + 1
    }, 0)
  }

  public fetchAll(): Animal[] {
    return this.entities
  }

  public getById(id: number): Animal {
    return this.entities.find(entity => id === entity.id)
  }

  public insert(entity: Animal): Animal {
    const newEntity = {
      id: this.entities.length + 1,
      ...entity,
    }

    this.entities.push(newEntity)

    return newEntity
  }

  public clear() {
    this.entities = []
  }
}
