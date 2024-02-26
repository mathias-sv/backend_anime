import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const port = 3000;
  console.log("🚀 Starting server...");
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("API Anime")
    .addBearerAuth()
    .setDescription("")
    .setVersion("1.0")
    .addTag("TEM")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);
  app.enableCors();
  await app.listen(port);
  console.log(`✅ Server started on http://localhost:${port} 🦄`);
}
bootstrap();

