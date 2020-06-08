const Event = require("../../models/event");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
  events: () => {
    return Event.find()
      .populate("creator")
      .then((events) => {
        return events.map((event) => {
          return {
            ...event._doc,
            date: new Date(event._doc.date).toISOString(),
            _id: event.id,
          };
        });
      })
      .catch((err) => {
        throw err;
      });
  },
  createEvent: (args) => {
    const { title, description, price, date } = args.eventInput;
    const event = new Event({
      title,
      description,
      price,
      date: new Date(date).toISOString(),
    });
    return event
      .save()
      .then((result) => {
        return {
          ...result._doc,
          date: result._doc.date.toISOString(),
          _id: result.id,
        };
      })
      .catch((err) => {
        throw err;
      });
  },
  createUser: async (args) => {
    const { email, password } = args.userInput;
    try {
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
    } catch (error) {
      throw error;
    }
  },
};
