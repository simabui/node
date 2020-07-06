const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const contactsRouter = require("./contacts/contacts.router");

const PORT = 3000;

class ContacsServer {
  constructor() {
    this.server = null;
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(morgan("tiny"));
    this.server.use(cors());
  }

  initRoutes() {
    this.server.use("/contacts", contactsRouter);
  }

  startListening() {
    this.server.listen(PORT, () => {
      console.log("Server started listening on port", PORT);
    });
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.startListening();
  }
}

new ContacsServer().start();
