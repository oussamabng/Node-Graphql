const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");
const graphqlHttp = require("express-graphql");

const app = express();

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      info: {
        title: "Swagger api",
        version: "1.0.0",
        description: "simple api build with node js and graphql",
        contact: {
          name: "bengoudifa oussama",
        },
      },
      servers: ["http://localhost:3000"],
    },
  },
  apis: ["app.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use(
  "/api/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerDocs)
);

app.use(bodyParser.json());

app.use(
  "/api",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

app.get("/", (req, res) => {
  res.send("response");
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-fxzxm.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
