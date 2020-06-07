const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Event = require("./models/event");

const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

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
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc, _id: event.id };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const { title, description, price } = args.eventInput;
        const event = new Event({
          title,
          description,
          date: new Date(args.eventInput.date),
          price,
        });
        return event
          .save()
          .then((result) => {
            console.log(result);
            return { ...result._doc, _id: result.id };
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-acksc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
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
