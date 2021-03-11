import { BadRequestException, Controller, Get, Param } from "@nestjs/common"
import { AppService } from "./app.service"
import { Animal } from "./animal.interface"

@Controller("/")
export class AppController {
  public constructor(private readonly appService: AppService) {}

  @Get("/suggestions/:animalId")
  public async getAllAnimals(
    @Param("animalId") animalId: string
  ): Promise<Animal> {
    try {
      const animal = await this.appService.getAnimalById(animalId)
      return await this.appService.suggestion(animal)
    } catch (e) {
      throw new BadRequestException()
    }
  }
}
