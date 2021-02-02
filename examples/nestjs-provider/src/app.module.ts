import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AppRepository } from "./app.repository"

@Module({
  controllers: [AppController],
  providers: [AppService, AppRepository],
  exports: [AppRepository],
})
export class AppModule {}
