import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@app/app.module';
import { PORT } from '@app/utils/environments';
// import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // TODO: check if we want to enable this
  // Configure global validation
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // Remove properties not in DTO
  //     forbidNonWhitelisted: true, // Throw error if disallowed properties are present
  //     transform: true, // Automatically transform types
  //   }),
  // );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LTecDeco API')
    .setDescription('API documentation for LTecDeco application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  await app.listen(PORT);

  console.log(`🚀 Server running at: http://localhost:${PORT}/api`);
}

bootstrap();
