'use strict';

let vkWrap  = require('./wrap.js'), 
  vkBot   = new vkWrap('login', 'password');

vkBot.authBot();

vkBot.setName('Бот');

vkBot.setWord({
  'привет': {
    1: 'Привет',
    2: 'Добрый день'
  },
  'пока': {
    1: 'Пока'
  }
});

vkBot.addCommand('помощь', () => {
  vkBot.sendMessage(`
    &#127808; Обращение к боту: ${vkBot.botName}. &#127808;
    
    &#127808; Пример команды - ${vkBot.botName}, помощь. &#127808;
    
    &#127830; помощь - все команды бота.
    &#127830; инфа <текст> - выдает случайный процент.
    &#127830; кто/кого/кому <текст> - выдает случайного человека из конфы.
    &#127830; когда <текст> - выдает случайную дату.
    
    &#128204; by devlix &#128204;
  `, {
    attachMessage: true,
    limitWord: 4
  });
});

vkBot.addCommand('инфа', () => {
  let random = parseInt(Math.random() * 100);
  vkBot.sendMessage(`Я думаю что на ${random}%`, {
    attachMessage: true,
    limitWord: 20
  });
});

vkBot.addCommand('кто кому кого', () => {
  let userObject = vkBot.usersChat[vkBot.bodyMsg.chat_id],
    random = parseInt(Math.random() * Object.keys(userObject).length);
  vkBot.sendMessage(`Я думаю что это &#127829; ${userObject[random]['first_name']} ${userObject[random]['last_name']} &#127829;`, {
    attachMessage: true, 
    limitWord: 20
  });
});

vkBot.addCommand('когда', () => {
  let date = new Date(),
      monthName = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
  date.setDate(date.getDate() + parseInt(Math.random() * 31));
  date.setMonth(date.getMonth() + parseInt(Math.random() * 12));
  if(parseInt(Math.random() * 100) > 70)
    date.setFullYear(date.getFullYear() + parseInt(Math.random() * 3));

  vkBot.sendMessage(`${date.getDate()} ${monthName[date.getMonth()]} ${date.getFullYear()} года`, {
    attachMessage: true, 
    limitWord: 20
  });
})