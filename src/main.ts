import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@app/app.module';
import { PORT } from '@app/utils/environments';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Configure global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      forbidNonWhitelisted: true, // Throw error if disallowed properties are present
      transform: true, // Automatically transform types
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LTecDeco API')
    .setDescription('API documentation for LTecDeco application')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-user-id',
        in: 'header',
        description: 'User ID from external provider authentication',
      },
      'x-user-id',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      docExpansion: 'none', // Collapse all sections by default
    },
  });

  await app.listen(PORT);

  console.log(`🚀 Server running at: http://localhost:${PORT}/api`);
}

bootstrap();
