const express = require("express");
const cors = require("cors");
const Analytics = require("./analytics");
require("dotenv").config();

class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();

    return this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(express.static("public"));
    this.server.use(cors());
  }

  initRoutes() {
    this.server.get("/", this.getPortfolioData);
  }

  async getPortfolioData(req, res) {
    const scopes = ["https://www.googleapis.com/auth/analytics", "https://www.googleapis.com/auth/analytics.edit"];
    const client_email = process.env.CLIENT_EMAIL;
    const accountId = process.env.ACCOUNT_ID;
    const viewId = process.env.VIEW_ID;
    const private_key = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");

    const myProject = new Analytics(scopes, client_email, accountId, viewId, private_key);

    try {
      const data = await myProject.getAnalyticsData();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  startListening() {
    const PORT = process.env.PORT;

    return this.server.listen(PORT, () => {
      console.log("Your app is listening on port " + PORT);
    });
  }
}

async function getPortfolioData() {
  const scopes = ["https://www.googleapis.com/auth/analytics", "https://www.googleapis.com/auth/analytics.edit"];
  const client_email = process.env.CLIENT_EMAIL;
  const accountId = process.env.ACCOUNT_ID;
  const viewId = process.env.VIEW_ID;
  const private_key = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");

  const myProject = new Analytics(scopes, client_email, accountId, viewId, private_key);
  const data = await myProject.getAnalyticsData();
  console.log(data);
}

module.exports = new Server();
