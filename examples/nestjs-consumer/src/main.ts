import { NestFactory } from "@nestjs/core"
import { Logger } from "@nestjs/common"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(8080)

  Logger.log("Animal Matching Service listening on http://localhots:8080")
}

bootstrap()
