/**
 * Configuration Swagger pour la documentation API
 * Génère la documentation interactive de l'API
 */

const swaggerJsdoc = require('swagger-jsdoc');
const dotenv = require('dotenv');
dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0', // Version OpenAPI
    info: {
      title: 'API Articles & Authentification',
      version: '1.0.0',
      description: 'Documentation complète de l\'API',
      contact: {
        name: 'Votre Nom',
        email: 'votre@email.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Serveur local'
      },
      {
        url: 'https://votre-api-en-production.com',
        description: 'Production'
      }
    ],
    components: {
      // Configuration de l'authentification JWT
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      // Définition des modèles de données
      schemas: {
        Article: {
          type: 'object',
          properties: {
            title: { 
              type: 'string',
              example: 'Titre de l\'article' 
            },
            author: { 
              type: 'string',
              example: 'Auteur de l\'article' 
            },
            journalName: { 
              type: 'string',
              example: 'Nom du journal' 
            },
            category: { 
              type: 'array',
              items: { 
                type: 'string',
                example: 'science' 
              }
            },
            description: { 
              type: 'string',
              example: 'Description de l\'article' 
            },
            imageUrl: { 
              type: 'string',
              example: 'http://example.com/image.jpg' 
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            username: { 
              type: 'string',
              example: 'john_doe' 
            },
            email: { 
              type: 'string',
              example: 'john@example.com' 
            },
            password: { 
              type: 'string',
              example: 'motdepasse123' 
            },
            role: { 
              type: 'string',
              enum: ['admin', 'member'],
              example: 'member' 
            }
          }
        },
        SearchResponse: {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      example: '15 article(s) trouvé(s) pour "technologie"'
    },
    articles: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Article'
      }
    },
    total: {
      type: 'integer',
      example: 15
    }
  }
}
        
      }
    }
  },
  // Fichiers contenant les annotations Swagger
  apis: [
    './routes/*.routes.js',
    './controllers/*.controller.js',
    './models/*.model.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;