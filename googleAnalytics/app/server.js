const express = require("express");
const cors = require("cors");
const Validator = require("./validation");
const Analytics = require("./analytics");
const Airtable = require("./airtable");

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
    this.server.post("/form", Validator.validateNewsLetterForm(), this.getFormData);
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

      data.sum = _sumAggregateData(data);

      res.status(200).json(data);
    } catch (e) {
      console.log(e);
      res.status(500).send();
    }
  }

  async getFormData(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const date = new Date().toISOString();

    try {
      await Airtable.create({ name, email, date });

      res.status(200).send();
    } catch (e) {
      res.status(500).send(e.message);
    }
  }

  startListening() {
    const PORT = process.env.PORT;

    return this.server.listen(PORT, () => {
      console.log("Your app is listening on port " + PORT);
    });
  }
}
function _sumAggregateData(data) {
  const acc = {
    yesterday: { total: 0, organic: 0 },
    monthly: { total: 0, organic: 0 },
  };
  let sum = data.aggregate.reduce((acc, current) => {
    return {
      yesterday: {
        total: parseInt(current.yesterday.total) + parseInt(acc.yesterday.total),
        organic: parseInt(current.yesterday.organic) + parseInt(acc.yesterday.organic),
      },
      monthly: {
        total: parseInt(current.monthly.total) + parseInt(acc.monthly.total),
        organic: parseInt(current.monthly.organic) + parseInt(acc.monthly.organic),
      },
    };
  }, acc);
  return sum;
}
module.exports = new Server();
