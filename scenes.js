const { Scenes } = require('telegraf');
const { keyboardYesNo, keyboardObjective, objectiveArray } = require('./keyboard');
const {
  addNum, reduceNum, addCosts, balance,
} = require('./firebase.js');

class SceneGenerator {
  addSumScene() {
    const sum = new Scenes.BaseScene('sumAdd');
    let currSum = 0;
    sum.enter(async (ctx) => {
      await ctx.reply('Введите сумму');
    });
    sum.hears(/^[0-9]+/, async (ctx) => {
      currSum = Number(ctx.message.text);
      if (currSum && currSum > 0) {
        await ctx.replyWithHTML(
          'Вы действительно хотите добавить сумму:\n\n'
          + `<i>${ctx.message.text}</i>`, keyboardYesNo.inline(),
        );
        await sum.action(['yes', 'no'], async (ctx) => {
          const { data } = ctx.update.callback_query;
          const uid = ctx.from.id;
          if (data === 'yes') {
            ctx.editMessageText('Спасибо');
            await addNum(uid, currSum);
            ctx.reply(`Ваш баланс увеличен на ${currSum}`);
            ctx.scene.leave();
          }
          if (data === 'no') {
            ctx.editMessageText('Спасибо');
            ctx.reply('Отменено пользователем');
            ctx.scene.leave();
          }
        });
        // ctx.scene.enter('sum')
      } else {
        await ctx.reply('Неправильный ввод данных');
        ctx.scene.reenter();
      }
    });
    sum.on('message', (ctx) => ctx.reply('Введите число'));
    return sum;
  }

  reduceSumScene() {
    const sum = new Scenes.BaseScene('sumReduce');
    let currSum = 0;
    sum.enter(async (ctx) => {
      await ctx.reply('Введите сумму');
    });
    sum.hears(/^[0-9]+/, async (ctx) => {
      currSum = Number(ctx.message.text);
      if (currSum && currSum > 0) {
        await ctx.replyWithHTML(
          'Вы действительно хотите вычесть сумму:\n\n'
          + `<i>${ctx.message.text}</i>`, keyboardYesNo.inline(),
        );
        await sum.action(['yes', 'no'], async (ctx) => {
          const { data } = ctx.update.callback_query;
          const uid = ctx.from.id;
          if (data === 'yes') {
            const budgetBoolean = await reduceNum(uid, currSum);
            if (budgetBoolean) {
              ctx.editMessageText('Спасибо');
              ctx.reply(`Ваш баланс уменьшен на ${currSum}`);
              ctx.scene.leave();
            } else {
              const money = await balance(ctx.from.id);
              ctx.editMessageText(`Ваш баланс: ${money}`);
              ctx.reply('Недостаточно средств');
              ctx.replyWithSticker({ source: 'images/bankrot.webp' });
              ctx.scene.leave();
            }
          }
          if (data === 'no') {
            ctx.editMessageText('Спасибо');
            ctx.reply('Отменено пользователем');
            ctx.scene.leave();
          }
        });
        // ctx.scene.enter('sum')
      } else {
        await ctx.reply('Неправильный ввод данных');
        ctx.scene.reenter();
      }
    });
    sum.on('message', (ctx) => ctx.reply('Введите число'));
    return sum;
  }

  costScene() {
    const costs = new Scenes.BaseScene('costs');

    costs.enter(async (ctx) => {
      await ctx.reply('На что вы потратили денежные средства?', keyboardObjective.inline());
      let db = '';
      await costs.action(objectiveArray, async (ctx) => {
        const { data } = ctx.update.callback_query;
        if (data && data !== 'Cancel') {
          await ctx.editMessageText('Спасибо', keyboardObjective.removeKeyboard());
          await ctx.reply(`Вы выбрали категорию "${data}"`);
          db = data;
          await ctx.reply('Введите сумму');
        } else {
          await ctx.editMessageText('Отменено пользователем', keyboardObjective.removeKeyboard());
          ctx.scene.leave();
        }
      });
      costs.on('message', async (ctx) => {
        if (!ctx.update.callback_query && !db) {
          await ctx.deleteMessage();
          await ctx.reply('Неправильный ввод данных', keyboardObjective.removeKeyboard());
        } else {
          const currSum = Number(ctx.message.text);
          if (currSum && currSum > 0) {
            const uid = ctx.from.id;
            const budgetBoolean = await reduceNum(uid, currSum);
            if (budgetBoolean) {
              await addCosts(uid, currSum, db);
              await ctx.replyWithHTML(
                '<b>Записано в базу данных</b>\n\n'
                  + `Категория: <i>${db}</i>\n\n`
                  + `Сумма: <i>${currSum}</i>\n\n`
                  + `Ваш баланс уменьшен на <i>${currSum}</i>\n\n`,
              );
              db = '';
              ctx.scene.leave();
            } else {
              const money = await balance(uid);
              ctx.reply(`Ваш баланс: ${money}`);
              ctx.reply('Недостаточно средств');
              ctx.replyWithSticker({ source: 'images/bankrot.webp' });
              ctx.scene.leave();
            }
          } else {
            await ctx.reply('Неправильный ввод данных, введите число больше нуля');
          }
        }
      });
    });
    return costs;
  }
}
module.exports = SceneGenerator;
