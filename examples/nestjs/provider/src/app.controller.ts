import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Animal } from './animal.interface';
import { AppRepository } from './app.repository';

@Controller('/animals')
export class AppController {
  public constructor(
    private readonly appService: AppService,
    private readonly repository: AppRepository,
  ) {}

  @Get('/')
  public getAllAnimals(): Animal[] {
    return this.repository.fetchAll();
  }

  @Get('/available')
  public availableAnimals(): Animal[] {
    return this.appService.availableAnimals();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.NOT_FOUND)
  public getAnimalById(@Param('id') id: number): Animal {
    const result = this.repository.getById(id);

    if (!result) {
      throw new NotFoundException('Animal not found');
    }

    return result;
  }

  @Post('/')
  public createAnimal(@Body() animal: Animal): Animal {
    return this.repository.insert(animal);
  }
}
