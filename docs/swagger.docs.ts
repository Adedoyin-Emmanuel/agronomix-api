const PORT = process.env.PORT || 2800;
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Agronomimix API",
    version: "1.0.0",
    description: "Agronomimix API Documentation",
    license: {
      name: "Adedoyin Emmanuel",
      url: "",
    },
    contact: {
      name: "",
      url: "",
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/v1`,
      description: "Development server",
    },
  ],
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: [`./routes/*.ts`],
};
