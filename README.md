# vkBot
###### Бот для сайта vk.com, написанный на javascript с использованием nodejs

[![Codacy Badge](https://api.codacy.com/project/badge/grade/0fc1cbc42b9b4de39e7317ad4fed21a7)](https://www.codacy.com/app/artur-irinatov/vkBot)

## Как использовать
1. npm install vkbot
```javascript
let vkWrap = require('vkBot')
```
2. Создать объект vkWrap, указав логин и пароль от аккаунта
```javascript
let vkBot = new vkWrap('login', 'password')
```

## Функции бота
1. Авторизация, используется для входа в ваш профиль
```javascript
vkBot.authBot();
```
2. Установить имя бота, по которому он будет отзываться (бот, помощь)
```javascript
vkBot.setName('Бот');
```
3. Добавить слова, на которые бот реагирует и отвечает (привет) (в разработке, частично работает)
```javascript
vkBot.setWord({
  'привет': {
    1: 'Привет',
    2: 'Добрый день'
  },
  'пока': {
    1: 'Бб',
    2: 'Пока'
  }
});
```
4. Добавить команду в бота
  * Первым аргументом идет команда, на которую реагирует бот (бот, помощь (команд может быть несколько через пробел))
  * Вторым - callback, который вызывается после реакции бота на команду
```javascript
vkBot.addCommand('помощь', () => {
  console.log('команда была вызвана')
});
```
5. Отправить сообщение
  * Первым аргументом идет текст сообщения
  * Вторым - объект, в котором: attachMessage - прикреплять сообщение, на которое ответил бот (default = true), limitWord - лимит слов в предложении, на который ответит бот (default = 10), attach - объект, в который вы можете прикреплять фото, аудио, видео и документы 
```javascript
vkBot.sendMessage('Я отправлюсь', {
  attachMessage: true,	//опционально
  limitWord: 20,			//опционально
  attach: {				//опционально
	photo: 'photo<owner_id>_<photo_id>'
  }
});
```
6. Сменить статус
```javascript
vkBot.setChangeStatus(true, () => {
  setInterval(() => {
    vkBot.changeStatus('через каждые 30 сек будет смена статуса');
  }, 30000);
});
```

###### Все примеры есть в example/index.js
