import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Interface for Swagger configuration options
 */
export interface SwaggerOptions {
  title?: string;
  description?: string;
  version?: string;
  path?: string;
  auth?: {
    type: 'bearer' | 'basic' | 'apiKey';
    scheme?: string;
    bearerFormat?: string;
  };
  tags?: string[];
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

/**
 * Setup Swagger documentation with enhanced configuration
 */
export const setupSwagger = (
  app: INestApplication,
  options?: SwaggerOptions,
) => {
  const config = new DocumentBuilder()
    .setTitle(options?.title || process.env.SWAGGER_TITLE || 'Greenwich AP API')
    .setDescription(
      options?.description ||
        process.env.SWAGGER_DESCRIPTION ||
        'Academic Programme Management System API - A comprehensive RESTful API for managing academic programmes, courses, and student data.',
    )
    .setVersion(options?.version || process.env.SWAGGER_VERSION || '1.0.0')
    .setContact(
      options?.contact?.name || 'API Support',
      options?.contact?.url || 'https://your-domain.com/support',
      options?.contact?.email || 'support@your-domain.com',
    );

  // Add authentication
  if (!options?.auth || options.auth.type === 'bearer') {
    config.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: options?.auth?.bearerFormat || 'JWT',
      },
      'access-token',
    );
  }

  // Add servers
  if (options?.servers) {
    options.servers.forEach((server) => {
      config.addServer(server.url, server.description);
    });
  } else {
    if (process.env.NODE_ENV === 'production' && process.env.BACKEND_URL) {
      config.addServer(process.env.BACKEND_URL, 'Production Server');
    } else {
      const port = process.env.PORT || 3000;
      config.addServer(`http://localhost:${port}`, 'Development server');
    }
  }

  // Add custom tags (if provided in options)
  if (options?.tags) {
    options.tags.forEach((tag) => {
      config.addTag(tag);
    });
  }

  const swaggerConfig = config.build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
    include: [],
    extraModels: [],
  });

  // Enhanced document with additional info
  document.info.contact = {
    name: options?.contact?.name || 'API Support',
    url: options?.contact?.url,
    email: options?.contact?.email,
  };

  // Add security schemes
  document.components = document.components || {};
  document.components.securitySchemes = {
    'access-token': {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  };

  const swaggerPath = options?.path || process.env.SWAGGER_PATH || 'docs';

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      displayRequestDuration: true,
      defaultModelRendering: 'model',
      defaultModelExpandDepth: 3,
      defaultModelsExpandDepth: 3,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      requestSnippets: {
        generators: {
          curl_bash: {
            title: 'cURL (bash)',
            syntax: 'bash',
          },
          curl_powershell: {
            title: 'cURL (PowerShell)',
            syntax: 'powershell',
          },
          curl_cmd: {
            title: 'cURL (CMD)',
            syntax: 'bash',
          },
        },
        defaultExpanded: true,
        languages: ['curl_bash', 'curl_powershell', 'curl_cmd'],
      },
    },
    customSiteTitle: 'Greenwich AP API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });
};
