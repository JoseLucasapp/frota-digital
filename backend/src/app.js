require("dotenv").config();
const express = require('express');
const cors = require('cors');
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const app = express();
const port = process.env.PORT || 5555;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Frota Digital API!</h1><br><a href="/api-docs">API Documentation</a><br><a href="/api">Use /api to API Routes</a>');
});


const router = express.Router();

app.use('/api', router);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Frota Digital API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: `http://localhost:${port}/api`,
      },
    ],
  },
  apis: [path.join(__dirname, "routes/*.js")],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.get("/", (req, res) => {
  res.send("Welcome to Frota Digital API!");
});

require('./routes')(router);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});