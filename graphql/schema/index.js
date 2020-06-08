const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type Event {
  _id : ID!
  title : String!
  description : String!
  price : Float!
  date : String!
  creator: User!
}
type User {
  _id: ID!
  email: String!
  password: String
  created_event: [Event!]
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
`);
