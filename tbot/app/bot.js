const { Telegraf } = require('telegraf');

class Bot extends Telegraf {
  constructor(token) {
    super(token);
  }

  initBot() {
    bot.use(session());
    bot.start(ctx =>
      ctx.reply('Welcome! 😊 Type any text and I will translate to English'),
    );
    bot.help(ctx => ctx.reply("Here's all the help I can give!"));
    bot.hears(/hi/gi, ctx => ctx.reply('Hey there from Dyk'));
    bot.on('message', ctx => {
      axios
        .get('https://translate.yandex.net/api/v1.5/tr.json/translate', {
          params: {
            key: process.env.YANDEX_API_KEY,
            text: ctx.message.text,
            lang: 'en',
          },
        })
        .then(res => ctx.reply(res.data.text[0]));
    });

    bot.command('from', ctx => {
      console.log(ctx.message.text);
      const lang = ctx.message.text.substring(6);

      if (lang.length > 2 || lang.length === 1) {
        ctx.reply('🤔 language code must be 2 chars, e.g. "en" or "fr"');
        return;
      }

      ctx.reply(
        lang
          ? '✅ "from" language set to ' + lang
          : '✅ autodetect "from" language',
      );
    });
    bot.startPolling();
  }
}

module.exports = Bot;
