const axios = require('axios');
const {
  Telegraf, Stage, Scenes, session,
} = require('telegraf');
const fs = require('fs');/// потом дропнуть файлы
require('dotenv').config().parsed;
const express = require('express');
const webp = require('webp-converter');
const { keyboardCommand, keyboardAddReduce } = require('./keyboard.js');
const createMyCanvas = require('./canvas');
const { addUserData, balance, allCosts } = require('./firebase.js');
const SceneGenerator = require('./scenes.js');

const currScene = new SceneGenerator();
const addSumScene = currScene.addSumScene();
const reduceSumScene = currScene.reduceSumScene();
const costScene = currScene.costScene();

const app = express();

const stage = new Scenes.Stage([
  addSumScene,
  reduceSumScene,
  costScene,
]);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

bot.context.db = { command: '', sum: '' };
// bot.context.db = { number: 0 }

bot.start(async (ctx) => {
  const { id, username, first_name } = ctx.from;

  const uid = id;

  ctx.replyWithHTML(
    `Привет, ${first_name}!✋\nЯ <b>saveMoney_bot</b>, давай будем хранить твой денежки правильно\n\n`
      + '/commands 👈 список команд',
    keyboardCommand.reply(),
  );
  const user = {
    uid,
    username,
    first_name,
  };

  const res = await axios.get(`${process.env.CHAT_APP_DB_URL}/users.json`)

  // const check = Object.keys(res.data);
  // if (!check.includes(uid)) {
    addUserData(...Object.values(user));
  // }
});

bot.hears('Commands', (ctx) => {
  ctx.replyWithHTML(
    '<b>/help</b> - небольшя инфа ℹ️\n\n'
    + '<b>/budget</b> - панель управления бюджетом 💰\n\n'
    + '<b>/balance</b>  - узнать баланс 💵\n\n'
    + '<b>/allCosts</b>  - все расходы 💴\n\n'
    + '<b>/date</b> - текущая дата 📅\n\n'
    + '<b>/whois</b> - информация о Вашем профиле ❓\n\n'
    + '<b>/graph</b> - диаграмма расходов 📊\n\n',
  );
});

bot.hears('/commands', (ctx) => {
  ctx.replyWithHTML(
    '<b>/help</b> - небольшя инфа ℹ️\n\n'
    + '<b>/budget</b> - панель управления бюджетом 💰\n\n'
    + '<b>/balance</b>  - узнать баланс 💵\n\n'
    + '<b>/allCosts</b>  - все расходы 💴\n\n'
    + '<b>/date</b> - текущая дата 📅\n\n'
    + '<b>/whois</b> - информация о Вашем профиле ❓\n\n'
    + '<b>/graph</b> - диаграмма расходов 📊\n\n',
  );
});

bot.command('whois', (ctx) => {
  const {
    id, username, first_name, last_name,
  } = ctx.from;
  return ctx.replyWithMarkdown(`Кто ты в телеграмме:
    *id* : ${id}
    *username* : ${username}
    *Имя* : ${first_name}
    *Фамилия* : ${last_name || 'неизвестно'}
    *chatId* : ${ctx.chat.id}`);
});
bot.command('balance', async (ctx) => {
  const { id } = ctx.from;
  const money = await balance(id);
  ctx.reply(`Ваш баланс: ${money}`);
});
bot.command('allCosts', async (ctx) => {
  const { id } = ctx.from;
  const costsObj = await allCosts(id);
  ctx.replyWithHTML(
    `<b>Дом</b> - ${costsObj.Home} 🏡\n\n`
    + `<b>Семья</b> - ${costsObj.Family} 👨‍👩‍👦\n\n`
    + `<b>Еда</b> - ${costsObj.Food} 🍔\n\n`
    + `<b>Путешествия</b> - ${costsObj.Travels} 🚌\n\n`
    + `<b>Развлечения</b> - ${costsObj.Entertainment} 🎉\n\n`
    + `<b>Другое</b> - ${costsObj.Other} 🤔\n\n`,
  );
});
bot.command('graph', async (ctx) => {
  const { id } = ctx.from;
  const costsObj = await allCosts(id);
  const canvas = await createMyCanvas(id, costsObj);
  if (canvas === null) {
    return ctx.reply('Вы ещё ничего не потратили');
  }
  fs.readFile(`${__dirname}/database/${id}.png`, (err) => {
    if (err) {
      console.log(err);
    }
    const file = `${__dirname}/database/${id}`;
    const result = webp.cwebp(`${file}.png`, `${file}.webp`, '-q 80', logging = '-v');
    result
      .then(() => ctx.replyWithHTML(
        `<b>Дом</b> - ${costsObj.Home} 🟢\n\n`
      + `<b>Семья</b> - ${costsObj.Family} 🟠\n\n`
      + `<b>Еда</b> - ${costsObj.Food} 🟡\n\n`
      + `<b>Путешествия</b> - ${costsObj.Travels} 🟣\n\n`
      + `<b>Развлечения</b> - ${costsObj.Entertainment} 🔴\n\n`
      + `<b>Другое</b> - ${costsObj.Other} 🔵\n\n`,
      ))
      .then(() => {
        ctx.replyWithSticker({ source: `${file}.webp` });
      })
      .then(() => {
        fs.unlinkSync(`${file}.png`);
        fs.unlinkSync(`${file}.webp`);
      });
  });
});
bot.command('date', (ctx) => {
  ctx.reply(String(new Date().toLocaleDateString()));
});
bot.command('stats', (ctx) => {
  ctx.reply('тут должна быть статистика');
});

bot.help((ctx) => ctx.replyWithHTML(
  '<b>Используемые пакеты:</b>\n\n'
  + '"telegraf: version 4.3.0"\n\n'
  + '"telegram-keyboard: version 2.2.6"\n\n'
  + '"firebase-admin: version 9.7.0"\n\n'
  + '"axios: version 0.21.1"\n\n'
  + '"webp-converter: version 2.3.3"\n\n'
  + '"canvas: version 2.7.0"',
));
bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.command('budget', (ctx) => ctx.reply('Чего вы хотите?', keyboardAddReduce.inline()));

bot.action(['Add', 'Reduce', 'Cost'], async (ctx) => {
  const { data } = ctx.update.callback_query;
  if (data === 'Add') {
    await ctx.editMessageText('Загрузка данных...', keyboardAddReduce.removeKeyboard());
    await ctx.scene.enter('sumAdd');
  }
  if (data === 'Reduce') {
    await ctx.editMessageText('Загрузка данных...', keyboardAddReduce.removeKeyboard());
    await ctx.scene.enter('sumReduce');
  }
  if (data === 'Cost') {
    await ctx.editMessageText('Загрузка данных...', keyboardAddReduce.removeKeyboard());
    await ctx.scene.enter('costs');
  }
});

bot.launch().then(() => console.log('Bot is running'));
const PORT = 3000;
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));
// express не нужен
