import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'File Manager API',
      version: '1.0.0',
      description: 'API documentation for the File Manager application',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'Path to the field with error'
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field'
                  }
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Admin status'
            }
          }
        },
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier'
            },
            name: {
              type: 'string',
              description: 'File or folder name'
            },
            type: {
              type: 'string',
              enum: ['folder', 'text', 'pdf', 'image', 'video', 'audio', 'other'],
              description: 'Type of the file'
            },
            mimeType: {
              type: 'string',
              description: 'MIME type of the file'
            },
            size: {
              type: 'integer',
              description: 'File size in bytes'
            },
            path: {
              type: 'string',
              description: 'File path on the server'
            },
            parentId: {
              type: ['string', 'null'],
              format: 'uuid',
              description: 'ID of the parent folder'
            },
            content: {
              type: ['string', 'null'],
              description: 'File content (for text files)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['name', 'type', 'mimeType', 'path']
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Files',
        description: 'File and folder operations'
      },
      {
        name: 'Auth',
        description: 'Authentication operations'
      },
      {
        name: 'Admin',
        description: 'Administrative operations'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options); 