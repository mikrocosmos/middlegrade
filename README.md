# MiddleGrade

Это приложение для студентов IT Top College, сделано для того, чтобы получить статистику о своём среднем балле и посещаемости. Средний балл переводится также и в пятибалльную систему.

## Инструкция по использованию

Убедиться в наличии на компьютере node.js, если его нет - [установить LTS версию](https://nodejs.org/en). Перейти в папку проекта, открыть терминал и написать команду "npm i", затем запустить приложение с помощью команды "npm run dev" в том же терминале, после чего открыть в браузере ссылку [http://localhost:5173/](http://localhost:5173/), а также регулярно обновлять данные в data.json. Увы, доступа к базе данных колледжа у меня нет, поэтому этот софт работает только со статичными данными.

Если у вас возникли трудности, в папке приложения есть видеоинструкция, где подробно описано, как запустить приложение без установки среды разработки.

## Функции

### Посмотреть полную статистику по успеваемости

Для того, чтобы получать данные из журнала, необходимо достать JSON-файл с данными о посещаемости. Чтобы его получить, нужно сделать следующие действия:

1. Зайти в журнал и нажать F12
2. Найти раздел "Сеть" и зайти в оценки
3. В консоли ищешь GET-запрос с именем "student-visits", он будет снизу, нажимаешь на него
4. Справа откроется содержание запроса, нужно зайти в раздел "Ответ" и скопировать оттуда всё содержимое, после чего перенести все данные из журнала в файл data.json, который находится в этом приложении в папке src/data.json. **Открыть файл можно в любом текстовом редакторе**, даже в блокноте, то есть устанавливать среду разработки не нужно.

В приложении есть видеоинструкция, как это сделать.

### Посмотреть статистику по отдельному предмету

Для этого можно воспользоваться выпадающим списком в верхней части приложения, он аналогичен такому же списку в Journal, и фильтрует посещаемость и оценки за выбранный предмет.

### Посмотреть статистику по экзаменам и зачётам

Действия точно те же, что и в пункте про успеваемость, только доставать из журнала нужно файл с названием **student-exams** и помещать данные в файл **src/zachetka.json**.
