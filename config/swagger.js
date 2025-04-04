const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SplitBill API',
      version: '1.0.0',
      description: 'Live API docs for SplitBill backend.',
    },
    servers: [
      {
        url: 'https://splitbill-api.onrender.com', // Update this
      },
    ],
    tags: [
      { name: 'Groups', description: 'Group management' },
      { name: 'Transactions', description: 'Expense and settlement' },
      { name: 'Receipts', description: 'Receipt uploads and views' },
      { name: 'AuthTest', description: 'Authentication test endpoint' },
    ],
    components: {
      securitySchemes: {
        firebaseAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        firebaseAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Adjust if you use src/
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
