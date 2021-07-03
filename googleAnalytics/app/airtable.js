const airtable = require("airtable");

class Airtable {
  constructor() {
    airtable.configure({
      apiKey: process.env.AIRTABLE_KEY,
    });
    this.base = airtable.base(process.env.AIRTABLE_BASE_NAME);
    this.table = this.base(process.env.AIRTABLE_TABLE_NAME);
    this.records = [];
  }

  async create(data) {
    try {
      await this.table.create(
        [
          {
            fields: {
              Name: data.name,
              Email: data.email,
              Date: data.date,
            },
          },
        ],

        (err) => {
          if (err) {
            console.log(err);
            return;
          }
        }
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  getAirtableRecords() {
    this.records = [];

    return new Promise((resolve, reject) => {
      if (this.records.length > 0) {
        return this.records;
      }

      const processPage = (partialRecords, fetchNextPage) => {
        this.records = [...this.records, ...partialRecords];
        fetchNextPage();
      };

      const processRecords = (err) => {
        if (err) {
          console.error(err);
          return;
        }

        resolve(this.records);
      };

      this.table
        .select({
          view: "Grid view",
        })
        .eachPage(processPage, processRecords);
    });
  }
}

module.exports = new Airtable();
