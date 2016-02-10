'use strict';

let vkWrap  = require('vkBot'), 
  vkBot   = new vkWrap('login', 'password'),
  request = require('request');

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

vkBot.setChangeStatus(true, () => {
  setInterval(() => {
    vkBot.changeStatus(
      `&#127808; vkBot by devlix &#127808;
       &#128233; Сообщений - скоро будет &#128233;
       &#128373; Обращений к боту -  ${vkBot.reqBot} &#128373;
      `
    );
  }, 30000);
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
});

vkBot.addCommand('музыка', () => {
  request({
      url: 'https://api.vk.com/method/audio.search',
      method: 'GET',
      qs: {
        access_token: vkBot.token,
        q: vkBot.fullMsg,
        count: 7
      }
    }, (error, response, body) => {
      try {
        let data = vkBot.parseJSON(body).response, result = {}, message;
        if(data[0] != 0) {
          for(let key in data) {
            result[key] = `audio${data[key]['owner_id']}_${data[key]['aid']}`;
          }
          delete result[0];
        } else {
          result = false, message = 'Не найдено';
        }
        vkBot.sendMessage(message, {
          attachMessage: true, 
          limitWord: 20,
          attach: result
        });
      } catch(e) {
        
      }
    });
});
