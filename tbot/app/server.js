const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { Telegraf } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const Bot = require('./bot');
const {
  generateSignature,
  generateXmlAuthorized,
  generateXmlPostAuth,
  generateCancelXmlAuthorized,
  verifyTokenSignature,
  generateGetStateXml,
} = require('./signature');
const { generateTokenSignature } = require('./invoicing');
require('dotenv').config();

const help = `Here's list of all commands:
 /start - start bot
 /hi - returns greeting message
 /from - set from which language translate
 /to - set to which language translate
`;

class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initBot();
    this.initRoutes();

    return this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(express.static('public'));
    this.server.use(cors());
  }

  initRoutes() {
    this.server.get('/sign', this.getSignature);
    this.server.get('/testPage', this.getPage);
    this.server.get('/capture', this.getCaptureSignature);
    this.server.get('/signXml', this.generateXmlSignature);
    this.server.get('/cancelXml', this.generateXmlCancelSignature);
    this.server.get('/stateXml', this.getState);
    this.server.get('/sigtoken', this.generateTokenSignature);
    this.server.get('/verify', this.verifySignature);
  }

  getPage(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
  }

  getSignature(req, res) {
    const signature = generateSignature();

    res.status(200).json(signature);
  }
  getCaptureSignature(req, res) {
    const signature = generateXmlPostAuth();

    res.status(200).json(signature);
  }

  generateXmlSignature(req, res) {
    generateXmlAuthorized();

    res.status(200).json();
  }

  generateXmlCancelSignature(req, res) {
    generateCancelXmlAuthorized();

    res.status(200).json();
  }

  generateTokenSignature(req, res) {
    const token = generateTokenSignature();

    res.status(200).json(token);
  }

  verifySignature(req, res) {
    const token = verifyTokenSignature();

    res.status(200).json(token);
  }

  getState(req, res) {
    generateGetStateXml();

    res.status(200).json();
  }

  initBot() {
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    bot.use(new LocalSession({ database: './data/session.json' }).middleware());
    bot.start(ctx =>
      ctx.reply(
        'Welcome! 😊 I am a translator, use commands /from and /to to set languages',
      ),
    );
    bot.help(ctx => ctx.reply(help));
    bot.hears(/hi/gi, ctx => ctx.reply('Hey there from Dyk'));

    bot.command('from', handleFrom);
    bot.command('to', handleTo);
    bot.on('message', handleMessage);

    bot.startPolling();
  }

  startListening() {
    const PORT = process.env.PORT;

    return this.server.listen(PORT, () => {
      console.log('Your app is listening on port ' + PORT);
    });
  }
}

//
function handleMessage(ctx) {
  const lang =
    (ctx.session.from ? ctx.session.from + '-' : '') + (ctx.session.to || 'en');

  axios
    .get('https://translate.yandex.net/api/v1.5/tr.json/translate', {
      params: {
        key: process.env.YANDEX_API_KEY,
        text: ctx.message.text,
        lang: lang,
      },
    })
    .then(res => ctx.reply(res.data.text[0]))
    .catch(e => ctx.reply(e.response.data.message));
}

function handleFrom(ctx) {
  const lang = ctx.message.text.substring(6);

  if (lang.length > 2 || lang.length === 1) {
    ctx.reply('🤔 language code must be 2 chars, e.g. "en" or "fr"');
    return;
  }
  ctx.session.from = lang;
  ctx.reply(
    lang
      ? '✅ "from" language set to ' + lang
      : '✅ autodetect "from" language',
  );
}

function handleTo(ctx) {
  const lang = ctx.message.text.substring(4);
  if (lang.length === 0) {
    ctx.reply(
      '🤔 please specify a language code! It must be 2 chars, e.g. "en" or "fr"',
    );
    return;
  }

  if (lang.length > 2 || lang.length === 1) {
    ctx.reply('🤔 language code must be 2 chars, e.g. "en" or "fr"');
    return;
  }

  ctx.session.to = lang;
  ctx.reply('✅ "to" language set to ' + lang);
}
//
module.exports = new Server();
