const express = require('express');

const app = express();

app.use(express.json());


const hello = {
    "response": {
      "text": "Здравствуйте! Выберите стих для заучивания",
      "tts": "Здравствуйте! Выберите стих для заучивания",  
      "buttons": [
          {
              "title": "А.С.Пушкин 'Ты и Вы'",
              "payload": {selectedId: 1},
              "hide": true
          },
          {
              "title": "Анна Ахматова 'А мы?'",
              "payload": {selectedId: 2},
              "hide": true
          }
      ],
      "end_session": false,
    },
    "version": "1.0"
  };

const menu = {
    "response": {
      "text": "Выберите стих для заучивания",
      "tts": "Выберите стих для заучивания",  
      "buttons": [
          {
              "title": "А.С.Пушкин 'Ты и Вы'",
              "payload": {selectedId: 1},
              "hide": true
          },
          {
              "title": "Анна Ахматова 'А мы?'",
              "payload": {selectedId: 2},
              "hide": true
          }
      ],
      "end_session": false,
    },
    "version": "1.0"
  };

const stih1 = {
  "response": {
      "text": `Пустое вы сердечным ты
Она, обмолвясь, заменила
И все счастливые мечты
В душе влюбленной возбудила.
Пред ней задумчиво стою,
Свести очей с нее нет силы;
И говорю ей: как вы милы!
И мыслю: как тебя люблю!`,
      "tts": `Пустое вы сердечным ты
Она, обмолвясь, заменила
И все счастливые мечты
В душе влюбленной возбудила.
Пред ней задумчиво стою,
Свести очей с нее нет силы;
И говорю ей: как вы милы!
И мыслю: как тебя люблю!`,  
      "buttons": [
          {
              "title": "Повторить",
              "payload": {selectedId: 1},
              "hide": true
          },
          {
              "title": "Меню",
              "payload": {goMain: true},
              "hide": true
          }
      ],
      "end_session": false,
    },
    "version": "1.0"
};

const stih2 = {
  "response": {
      "text": `А мы?
Не так же ль мы
Сошлись на краткий миг для переклички?`,
      "tts": `А мы?
Не так же ль мы
Сошлись на краткий миг для переклички?`,  
      "buttons": [
          {
              "title": "Повторить",
              "payload": {selectedId: 2},
              "hide": true
          },
          {
              "title": "Меню",
              "payload": {goMain: true},
              "hide": true
          }
      ],
      "end_session": false,
    },
    "version": "1.0"
};

app.post('/', (req, res) => {
  console.log('post');
  const body = req.body;
  console.log(body);
  const {request, session} = body;
  if(session.new) return res.send(hello);
  const {selectedId, goMain} = request?.payload;
  if(goMain) return res.send(menu);
  if(selectedId === 1) return res.send(stih1);
  if(selectedId === 2) return res.send(stih2);
  
})

app.listen(3000, () => console.log('listen 3000'));