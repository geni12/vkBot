'use strict';

let request = require('request'),
    fs = require('fs');

class dialogBotVK {
  constructor(login, password) {
    this.login      = login,
      this.password = password,
      this.safe     = true,
      this.temp     = false,
      this.apiVer   = '5.44',
      this.botName  = 'бот',
      this.modDialg = 1,
      this.tempPoll = {},
      this.tempMsg  = {},
      this.bodyMsg  = {},
      this.typeMsg  = 0,
      this.token    = 0,
      this.botID    = 0;
      
    this.commandBot = [];
    this.wordBot = {};
    this.usersChat = {};
  }

  authBot() {
    try {
      request(this.getObject('auth'), (error, response, body) => {
        if (!error && response.statusCode == 200) {
          this.temp = this.parseJSON(body);
          this.token = this.temp['access_token'];
          this.botID = this.temp['user_id'];
          
          this.getLongPollServer();
        } else {
          throw new Error(`Ошибка отправки запроса авторизации, подробнее: ${body}`);
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
  
  getLongPollServer() {
    request(this.getObject('longpollServer'), (error, response, body) => {
      try {
        if (!error && response.statusCode == 200) {
          this.tempPoll = this.parseJSON(body)['response'];
          this.getLongPollMessage();
        } else {
          throw new Error(`Ошибка получения данных longpoll сервера, подробнее: ${body}`);
        }
      } catch(e) {
        console.log(e);
      }
    });
  }
  
  getLongPollMessage() {
    request(this.getObject('longpollMessage'), (error, response, body) => {
      try {
        this.tempPoll['ts'] = this.parseJSON(body)['ts'];
        this.getLongPollMessage().getMessage(this.parseJSON(body)['updates']);
      } catch(e) {
        this.getLongPollMessage();
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
          if (!error && response.statusCode == 200) {
            this.tempMsg = this.parseJSON(body);
            this.filterMessage();
          } else {
            console.log(`Невозможно получить json данные сообщения ${this.tempMsgID}, подробнее: ${body}`);
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
      if(this.bodyMsg.body.toLowerCase().match(this.botName, 'g')) {
        for(let i = 0; i < this.commandBot.length; i+=2) {
          commandStatus = 0;
          this.commandBot[i].split(' ').forEach((item) => {
            if(this.bodyMsg.body.toLowerCase().match(item, 'g')) {
              if(commandStatus === 0) {
                this.commandBot[i+1]();
                commandStatus = 1;
              }
            }
          });
        }
      }
      
      if(this.modDialg === 1) {
        if(this.bodyMsg['body'].toLowerCase() in this.wordBot) {
          let sizeObject = Object.keys(this.wordBot[this.bodyMsg['body']]).length;
          this.sendMessage(this.wordBot[this.bodyMsg['body']][parseInt(Math.random() * sizeObject)], {
            attachMessage: false,
            limitWord: 1
          });
        }
      }
      
      if(this.bodyMsg.body.toLowerCase().match(/.*?\).*(\?\)|\))/g)) {
        let text = this.bodyMsg.body.toLowerCase().match(/.*?\).*(\?\)|\))/g)[0];
        fs.readFile('lavash.txt', {encoding: 'utf8'}, function (err, data) {
          if (err) {
            fs.writeFile("lavash.txt", '{}');
          }
          try {
            let test = JSON.parse(data);
            test[Object.keys(test).length] = text;
            fs.writeFile("lavash.txt", JSON.stringify(test));
          } catch(e) {
            fs.writeFile("lavash.txt", '{}');
          }
        });
      }
 
      console.log(this.typeMsg, this.tempMsg);
    } catch(e) {
      console.log(e);
    }
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
      if (!error && response.statusCode == 200) {
        try {
          this.usersChat[this.bodyMsg['chat_id']] = this.parseJSON(body)['response'];
        } catch(e) {
          console.log(e);
        }
      }
    });
  }
  
  sendMessage(messageText, options) {
    /*if(this.botID == this.bodyMsg['uid']) 
      return true;*/
      
    let optionsDefault = {
      attachMessage: true,
      limitWord: 10
    };
    
    optionsDefault['attachMessage'] = options['attachMessage'];
    optionsDefault['limitWord'] = options['limitWord'];
    
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
    
    if(this.typeMsg == 0)
      object['qs']['chat_id'] = this.bodyMsg['chat_id'];
    else 
      object['qs']['user_id'] = this.bodyMsg['uid'];
      
    if(optionsDefault['attachMessage'] == true)
      object['qs']['forward_messages'] = this.bodyMsg['mid'];
    
    
    request(object, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        //console.log(body);
      }
    });
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
      break;
      case 'longpollServer':
        return {
          url:              'https://api.vk.com/method/messages.getLongPollServer',
          method:           'GET',
          qs: {
            access_token:   this.token,
          }
        };
      break;
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
      break;
      case 'getMessage': 
        return {
          url:              'https://api.vk.com/method/messages.getById',
          method:           'GET',
          qs: {
            access_token:   this.token,
            message_ids:    this.tempMsgID
          }
        };
      break;
    }
  }
}

module.exports = dialogBotVK;