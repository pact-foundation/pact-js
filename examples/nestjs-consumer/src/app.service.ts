import { HttpService, Injectable } from "@nestjs/common"
import { Animal } from "./animal.interface"

@Injectable()
export class AppService {
  private static readonly AUTH_HEADER = { authorization: "Bearer token" }

  private static getApiEndpoint() {
    return process.env.API_HOST || "http://localhost:8081"
  }

  public constructor(private readonly http: HttpService) {}

  public async availableAnimals(): Promise<Animal[]> {
    const { data } = await this.http
      .get(`${AppService.getApiEndpoint()}/animals/available`, {
        headers: { ...AppService.AUTH_HEADER },
      })
      .toPromise()

    return data
  }

  public async getAnimalById(id: string | number): Promise<Animal> {
    const { data } = await this.http
      .get(`${AppService.getApiEndpoint()}/animals/${id}`, {
        headers: { ...AppService.AUTH_HEADER },
      })
      .toPromise()

    return data
  }

  public async suggestion(mate: Animal): Promise<any> {
    const predicates = [
      (candidate, animal) => candidate.id !== animal.id,
      (candidate, animal) => candidate.gender !== animal.gender,
      (candidate, animal) => candidate.animal === animal.animal,
    ]

    const weights = [
      (candidate, animal) => Math.abs(candidate.age - animal.age),
    ]

    return this.availableAnimals().then((availableAnimals: Animal[]) => {
      const eligible = availableAnimals.filter(
        a => !predicates.map(p => p(a, mate)).includes(false)
      )

      return {
        suggestions: eligible.map(candidateAnimal => {
          const score = weights.reduce((acc, weight) => {
            return acc - weight(candidateAnimal, mate)
          }, 100)

          return {
            score,
            animal: candidateAnimal,
          }
        }),
      }
    })
  }

  public async createMateForDates(mate: Animal): Promise<Animal> {
    const { data } = await this.http
      .post(`${AppService.getApiEndpoint()}/animals`, mate, {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      })
      .toPromise()

    return data
  }
}
