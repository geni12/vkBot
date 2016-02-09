# vkBot
###### Бот для сайта vk.com, написанный на javascript с использованием nodejs

[![Codacy Badge](https://api.codacy.com/project/badge/grade/0fc1cbc42b9b4de39e7317ad4fed21a7)](https://www.codacy.com/app/artur-irinatov/vkBot)

## Как использовать
1. Включить wrapper.js в ваш файл
```javascript
let vkWrap = require('./wrapper.js')
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
3. Добавить слова, на которые бот реагирует и отвечает (бот, привет) (в разработке)
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
  * Вторым - калбек, который вызывается после реакции бота на команду
```javascript
vkBot.addCommand('помощь', () => {
  console.log('команда была вызвана')
});
```
5. Отправить сообщение
  * Первым аргументом идет текст сообщения
  * Вторым - объект, в котором: attachMessage - прикреплять сообщение, на которое ответил бот (default = true), limitWord - лимит слов в предложении, на который ответит бот (default = 10)
```javascript
vkBot.sendMessage('Я отправлюсь', {
    attachMessage: true,
    limitWord: 20
  });
```

###### Все примеры есть в example/index.js
