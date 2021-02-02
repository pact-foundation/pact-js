import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from "@nestjs/common"
import { AppService } from "./app.service"
import { Animal } from "./animal.interface"
import { AppRepository } from "./app.repository"
import { AppInterceptor } from "./app.guard"

@Controller("/animals")
@UseInterceptors(new AppInterceptor())
export class AppController {
  public constructor(
    private readonly appService: AppService,
    private readonly repository: AppRepository
  ) {}

  @Get("/")
  public getAllAnimals(): Animal[] {
    return this.repository.fetchAll()
  }

  @Get("/available")
  public availableAnimals(): Animal[] {
    return this.appService.availableAnimals()
  }

  @Get("/:id")
  public getAnimalById(@Param("id") id: string): Animal {
    const result = this.repository.getById(parseInt(id, 10))

    if (!result) {
      throw new NotFoundException("Animal not found")
    }

    return result
  }

  @Post("/")
  public createAnimal(@Body() animal: Animal): Animal {
    return this.repository.insert(animal)
  }
}
