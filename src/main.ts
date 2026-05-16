import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.PORT || 4000;

    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Swagger
    setupSwagger(app);

    // Start server
    await app.listen(port);

    // --- Configuration for Display ---
    const serverName = 'CLOUDIAN_SERVER';
    const url = `http://localhost:${port}/api`;
    const docsUrl = `http://localhost:${port}/api/docs`;
    const status = 'RUNNING';

    // ANSI Colors
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const magenta = '\x1b[35m';
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';

    const pad = (str: string, len: number) => str.padEnd(len);

    console.log(`
${cyan}╔══════════════════════╦════════════════════════════════════╗${reset}
${cyan}║${reset} ${bold}  SERVER STARTED SUCCESSFULLY CLOUD${reset}                       ${cyan}║${reset}
${cyan}╠══════════════════════╬════════════════════════════════════╣${reset}
${cyan}║${reset} ${bold}SERVICE${reset}              ${cyan}║${reset} ${pad(serverName, 34)} ${cyan}║${reset}
${cyan}║${reset} ${bold}PORT${reset}                 ${cyan}║${reset} ${pad(port.toString(), 34)} ${cyan}║${reset}
${cyan}║${reset} ${bold}API URL${reset}              ${cyan}║${reset} ${yellow}${pad(url, 34)}${reset} ${cyan}║${reset}
${cyan}║${reset} ${bold}SWAGGER DOCS${reset}         ${cyan}║${reset} ${magenta}${pad(docsUrl, 34)}${reset} ${cyan}║${reset}
${cyan}║${reset} ${bold}STATUS${reset}               ${cyan}║${reset} ${green}● ${pad(status, 32)}${reset} ${cyan}║${reset}
${cyan}╚══════════════════════╩════════════════════════════════════╝${reset}
`);
}

function setupSwagger(app: INestApplication): void {
    if (process.env.NODE_ENV === 'production') return;

    const config = new DocumentBuilder()
        .setTitle('Concert Ticket Booking API')
        .setDescription(
            'Backend API documentation for Concert Ticket Booking Platform',
        )
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT access token',
            },
            'access-token',
        )
        .addSecurityRequirements('access-token')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Concert Booking API Docs',
    });
}

bootstrap();
