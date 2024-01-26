const mongoose = require('mongoose');

function connect() {
  mongoose.connect(process.env.MONGO_URI, {
  // mongoose.connect("mongodb://localhost:27017/Test1?retryWrites=true", {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: true,
  })
  .then(() => console.log('MongoDB connecting Success!!'))
  .catch((e) => console.log(e));

  mongoose.connection.on('disconnected', connect);
}

module.exports = () => connect();
