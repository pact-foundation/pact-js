import { Injectable } from "@nestjs/common"
import { AppRepository } from "./app.repository"
import { Animal } from "./animal.interface"

@Injectable()
export class AppService {
  public constructor(private readonly repository: AppRepository) {}

  public availableAnimals(): Animal[] {
    return this.repository.fetchAll().filter(animal => {
      return animal.eligibility.available
    })
  }
}
