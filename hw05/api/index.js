const morgan = require('morgan');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const contactsRouter = require('./contacts/contacts.router');
const userRouter = require('./users/users.router');

require('dotenv').config();

module.exports = class ContacsServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDatabase();
    return this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(express.static('public'));
    this.server.use(morgan('tiny'));
    this.server.use(cors());
  }

  initRoutes() {
    this.server.use('/contacts', contactsRouter);
    this.server.use('/', userRouter);
  }

  async initDatabase() {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  startListening() {
    const PORT = process.env.PORT;

    return this.server.listen(PORT, () => {
      console.log('Server listening on port', PORT);
    });
  }
};
