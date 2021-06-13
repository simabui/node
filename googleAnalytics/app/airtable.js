const airtable = require("airtable");

class Airtable {
  constructor() {
    airtable.configure({
      apiKey: process.env.AIRTABLE_KEY,
    });
    this.base = airtable.base(process.env.AIRTABLE_BASE_NAME);
    this.table = this.base(process.env.AIRTABLE_TABLE_NAME);
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
}

module.exports = new Airtable();
