const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

const events = [];

app.use(
  "/api",
  graphqlHttp({
    schema: buildSchema(`
        type Event {
          _id : ID!
          title : String!
          description : String!
          price : Float!
          date : String!
        }
        type RootQuery {
            events : [Event!]!
        }
        input eventSerializer {
          title : String!
          description : String!
          price : Float!
          date : String!
        }
        type RootMutation {
            createEvent(eventInput : eventSerializer) : Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
        `),
    rootValue: {
      events: () => {
        return events;
      },
      createEvent: (args) => {
        const { title, description, date, price } = args.eventInput;
        const event = {
          _id: Math.random().toString(),
          title,
          description,
          price,
          date,
        };
        events.push(event);
        return event;
      },
    },
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
