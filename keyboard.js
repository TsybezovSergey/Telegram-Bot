const { Keyboard, Key } = require('telegram-keyboard');

const keyboardCommand = Keyboard.make([
  [{
    text: 'Commands',
  }],
]);

const keyboardYesNo = Keyboard.make([
  Key.callback('Да', 'yes'),
  Key.callback('Нет', 'no'),
]);

const keyboardAddReduce = Keyboard.make([
  Key.callback('Добавить сумму', 'Add'),
  Key.callback('Вычесть', 'Reduce'),
  Key.callback('Расходы', 'Cost'),
], {
  columns: 2,
});

const keyboardObjective = Keyboard.make([
  Key.callback('Дом', 'Home'),
  Key.callback('Семья', 'Family'),
  Key.callback('Путешествия', 'Travels'),
  Key.callback('Еда', 'Food'),
  Key.callback('Развлечения', 'Entertainment'),
  Key.callback('Другое', 'Other'),
  Key.callback('Отмена', 'Cancel'),
], {
  columns: 1,
});

const objectiveArray = ['Home', 'Family', 'Travels', 'Food', 'Entertainment', 'Other', 'Cancel'];

module.exports = {
  keyboardCommand, keyboardYesNo, keyboardAddReduce, keyboardObjective, objectiveArray,
};
