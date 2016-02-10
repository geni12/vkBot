'use strict';

let request = require('request'),
    fs = require('fs');

class dialogBotVK {
  constructor(login, password) {
    this.login      = login,
      this.password = password,
      this.safe     = true,
      this.temp     = false,
      this.botName  = 'бот',
      this.modDialg = 1,
      this.tempPoll = {},
      this.tempMsg  = {},
      this.bodyMsg  = {},
      this.fullMsg  = false,
      this.typeMsg  = 0,
      this.changeS  = false,
      this.limitMsg = {},
      this.token    = 0,
      this.botID    = 0,
      this.reqBot   = 0;
      
    this.commandBot = [];
    this.wordBot = {};
    this.usersChat = {};
  }

  authBot() {
    try {
      request(this.getObject('auth'), (error, response, body) => {
        if (!error && response.statusCode === 200) {
          this.temp = this.parseJSON(body);
          this.token = this.temp['access_token'];
          this.botID = this.temp['user_id'];
          
          this.getLongPollServer();
          
          console.log(`Авторизация прошла успешно, ID: ${this.botID}`);
        } else {
          throw new Error(`Авторизация провалилась, подробнее: ${body}`);
        }
      });
    } catch(e) {
      console.log(e);
    }
  }
  
  setName(name) {
    this.botName = name.toLowerCase();
  }
  
  setWord(word) {
    this.wordBot = word;
  }
  
  setChangeStatus(bool, callback) {
    this.changeS = bool;
    callback();
  }
  
  getLongPollServer() {
    try {
      request(this.getObject('longpollServer'), (error, response, body) => {
        if (!error && response.statusCode === 200) {
          this.tempPoll = this.parseJSON(body)['response'];
          this.getLongPollMessage();
            
          console.log(`Бот успешно получил данные с лонгполлинг сервера`);
        } else {
          throw new Error(`Получение данных с лонгполлинг сервера не удалось, подробнее: ${body}`);
        }
      });
    } catch(e) {
      console.log(e);
    }
  }
  
  getLongPollMessage() {
    request(this.getObject('longpollMessage'), (error, response, body) => {
      try {
        let data = this.parseJSON(body);
        if('failed' in data) {
          this.longpollServer();
        } else {
          this.tempPoll['ts'] = this.parseJSON(body)['ts'];
          this.getMessage(this.parseJSON(body)['updates']);
          this.getLongPollMessage();
            
          console.log(`Обновление сообщения с лонгполлинг сервера полученно`, this.parseJSON(body));
        }
      } catch(e) {
        this.getLongPollMessage();
      
        console.log(`Сообщения не появлялись, попробуем снова`);
      }
    });
    return this;
  }
  
  getMessage(message) {
    try {
      let block = message[0];
      if(6 in block) {
        this.tempMsgID = block[1];
        request(this.getObject('getMessage'), (error, response, body) => {
          if (!error && response.statusCode === 200) {
            this.tempMsg = this.parseJSON(body);
            this.filterMessage();
            
            console.log(`Полученны json данные о сообщении`);
          } else {
            console.log(`Невозможно получить json данные сообщения ${this.tempMsg}, подробнее: ${error}`);
          }
        });
      }
    } catch(e) {
      //console.log(e);
    }
  }
  
  filterMessage() {
    try {
      this.bodyMsg = this.tempMsg['response'][1];
      
      if('chat_id' in this.bodyMsg) {
        this.typeMsg = 0;
        this.getUsersChat(this.bodyMsg['chat_active']);
      } else {
        this.typeMsg = 1;
      }
        
      let commandStatus = 0;
      
      if(this.bodyMsg['body'].toLowerCase().match(this.botName)) {
        this.fullMsg = false;
        
        for(let i = 0; i < this.commandBot.length; i+=2) {
          
          this.commandBot[i].split(' ').forEach((item) => {
            if(this.bodyMsg['body'].toLowerCase().match(item)) {
              if(commandStatus === 0) {
                
                if(this.checkLimit(10) === false)
                  return false;
                
                this.fullMsg = this.bodyMsg['body'].toLowerCase().replace(this.botName, '').replace(item, '').replace(',', '').trim();
                this.commandBot[i+1]();
                this.reqBot++;
                
                commandStatus = 1;
              }
            }
          });
        }
      }
      
      if(this.modDialg === 1) {
        let text = this.bodyMsg['body'].toLowerCase();
        
        if(text in this.wordBot) {
          let sizeObject = Object.keys(this.wordBot[text]).length;
          
          this.sendMessage(this.wordBot[text][parseInt(Math.random() * sizeObject)+1], {
            attachMessage: false,
            limitWord: 1
          });
        }
      }
 
      console.log(`${this.bodyMsg['uid']}: ${this.bodyMsg['body']}`);
    } catch(e) {
      console.log(`${e} непредвиденная ошибка ${this.bodyMsg}`);
    }
  }
  
  checkLimit(num) {
    let sender = this.bodyMsg['uid'], status = true;
    
    if(sender in this.limitMsg) {
      if(this.limitMsg[sender]['msg'] === num) {
        status = false;
        
        if(this.limitMsg[sender]['timeout'] === false) {
          setTimeout(() => {
            this.limitMsg[sender]['msg'] = 0;
            this.limitMsg[sender]['timeout'] = false;
          }, 60000);
          this.limitMsg[sender]['timeout'] = true;
        }
      } else {
        if(this.bodyMsg['uid'] != this.botID)
          this.limitMsg[sender]['msg']++;
      }
    } else {
      this.limitMsg[sender] = {};
      this.limitMsg[sender]['msg'] = 0;
      this.limitMsg[sender]['timeout'] = false;
    }
    
    console.log(this.limitMsg, sender);
    
    return status;
  }
  
  getUsersChat(ids) {
    if(this.bodyMsg['chat_id'] in this.usersChat)
      return false;
    
    request({
      url:                  'http://api.vk.com/method/users.get',
      qs: {
        user_ids:           ids
      }
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        try {
          this.usersChat[this.bodyMsg['chat_id']] = this.parseJSON(body)['response'];
        } catch(e) {
          console.log(e);
        }
      }
    });
  }
  
  sendMessage(messageText, options) {
    let optionsDefault = {
      attachMessage: true,
      limitWord: 10,
      attach: false
    };
    
    if('attachMessage' in options)
      optionsDefault['attachMessage'] = options['attachMessage'];
    if('limitWord' in options)
      optionsDefault['limitWord'] = options['limitWord'];
    if('attach' in options)
      optionsDefault['attach'] = options['attach'];
    
    if(this.bodyMsg.body.split(' ').length > optionsDefault['limitWord'])
      return false;
    
    let object = {
      url:                  'https://api.vk.com/method/messages.send',
      method:               'GET',
      qs: {
        access_token:       this.token,
        guid:               parseInt(Math.random() * 500010),
        message:            messageText
      }
    };
    
    if(this.typeMsg === 0)
      object['qs']['chat_id'] = this.bodyMsg['chat_id'];
    else 
      object['qs']['user_id'] = this.bodyMsg['uid'];
      
    if(optionsDefault['attachMessage'] === true)
      object['qs']['forward_messages'] = this.bodyMsg['mid'];
      
    if(optionsDefault['attach'] !== false) {
      let attach = '', index = 0;
      for(let key in optionsDefault['attach']) {
        attach += optionsDefault['attach'][key];
        if(index > 0) attach += ',';
        index++;
      }
      object['qs']['attachment'] = attach;
    }
    
    
    request(object, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        //console.log(body);
      }
    });
  }
  
  changeStatus(text) {
    if(this.changeS === true) {
      request({
        url: 'https://api.vk.com/method/status.set',
        qs: {
          access_token:   this.token,
          text: text
        }
      }, (error, response, body) => {
        console.log('Смена статуса произведена');
      });
    }
  }
  
  addCommand(text, callback) {
    this.commandBot.push(text.toLowerCase(), callback);
  }
  
  parseJSON(json) {
    try {
      return JSON.parse(json);
    } catch(e) {
      console.log('Невозможно преобразовать в JSON формат');
    }
  }
  
  getObject(name) {
    switch(name) {
      case 'auth': 
        return {
          url:              'https://oauth.vk.com/token',
          method:           'GET',
          qs: {
            grant_type:     'password',
            client_id:      2274003,
            client_secret:  'hHbZxrka2uZ6jB1inYsH',
            username:       this.login,
            password:       this.password
          }
        };
      case 'longpollServer':
        return {
          url:              'https://api.vk.com/method/messages.getLongPollServer',
          method:           'GET',
          qs: {
            access_token:   this.token,
          }
        };
      case 'longpollMessage': 
        return {
          url:              'http://'+this.tempPoll.server,
          method:           'GET',
          qs: {
            act:            'a_check',
            key:            this.tempPoll.key.substr(0, (this.tempPoll.key.length - 10)),
            ts:             this.tempPoll.ts,
            wait:           25,
            mode:           2
          }
        };
      case 'getMessage': 
        return {
          url:              'https://api.vk.com/method/messages.getById',
          method:           'GET',
          qs: {
            access_token:   this.token,
            message_ids:    this.tempMsgID
          }
        };
    }
  }
}

module.exports = dialogBotVK;