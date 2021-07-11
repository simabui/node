const nodemailer = require("nodemailer");

class Mail {
  async initMail() {
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  async sendEmail() {
    await this.initMail();

    const mailOptions = {
      from: 'Fred Foo 👻" <foo@example.com>',
      to: "vito321123@gmail.com",
      subject: "Congratulations! You are successfuly subscribed to us!",
      html: "<h2>Поздравляем, Вы успешно подписались на нашем сайте!</h2>",
    };

    await this.transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        // email sent
        console.log(info);
      }
    });
  }
}

module.exports = new Mail();
