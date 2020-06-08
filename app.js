const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/user");
const bcrypt = require("bcryptjs");

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
        type User {
          _id: ID!
          email: String!
          password: String
        }
        input userSerialier {
          email: String!
          password: String!
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
            createUser(userInput: userSerialier) : User  
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
            return { ...result._doc, password: null, _id: result.id };
          })
          .catch((err) => {
            throw err;
          });
      },
      createUser: async (args) => {
        const { email, password } = args.userInput;
        const user = await User.findOne({ email });
        if (user) {
          throw new Error("User Already exist");
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
          email,
          password: hashedPassword,
        });
        await newUser.save();
        return { ...newUser._doc, password: null, _id: newUser._id.toString() };
      },
    },
    graphiql: true,
  })
);

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
