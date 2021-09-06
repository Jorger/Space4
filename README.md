# 🚀 Space4

Space4 es un juego realizado para la edición 2021 de la [JS13k](https://js13kgames.com/), cuyo tema fue [SPACE](https://medium.com/js13kgames/js13kgames-2021-has-started-aa9345fd9fdf).

En está competencia existe la categoría de [server](https://github.com/js13kGames/js13kserver), en la cual se entrega un proyecto el cual ya tiene configurado lo necesario para establecer una conexión en tiempo real, en este caso haciedo uso de la popular librería conocida como [socket.io](https://socket.io/), 
la idea es que el juego comprimido en un acrhivo .zip no supere los 13KB, para este juego el archivo que contiene todo el juego y que pesa 13 KB, es el denominado [dist.zip](https://github.com/Jorger/Space4/blob/main/dist.zip), los archivos comprimidos está ubicados en la carpeta [public](https://github.com/Jorger/Space4/tree/main/public), 
de la misma forma los archivos no comprimidos del juego se encuetran en la carpeta [public_uncompressed](https://github.com/Jorger/Space4/tree/main/public_uncompressed)

## 📖 Reglas.

* En un turno, un jugador toca una columna para dejar caer un "meteoro".
* Los jugadores se turnan para colocar meteoros hasta que cada jugador obtenga cuatro de sus meteoros en una fila, columna o diagonal.
* Cuando hay cuatro meteoros del mismo color seguidas, ese jugador gana!

## 🎮 Modalidades de Juego.

El juego cuenta con dos tipos de modalidades como son:

* **1️⃣ Offline:** Que a la vez se componente de:

  * 👽 Two Players
  * 🤖 vs Bot
  
* **2️⃣ Online:** De la misma forma se compone de:

  * 🌎 Play Online
  * 🤝 Play with friends
  

## 1️⃣ Offline.

En está modalidad toda la actividad del juego se lleva a cabo en el mismo dispotivo, gracias al uso de [service workers](https://developers.google.com/web/fundamentals/primers/service-workers), el juego puede funcionar offline, además de ser un [PWA](https://web.dev/progressive-web-apps/)

### 👽 Two Players

En esta modalidad la partida se llevará a cabo en el mismo dispositivo.

### 🤖 vs Bot

En esta modalides se competirá vs un bot, es una modalidad que también sirve como práctica, a la vez se cuenta con tres modos de dificultad.


