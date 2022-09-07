# 🚀 Space4

Space4 es un juego realizado para la edición 2021 de la [JS13k](https://js13kgames.com/), cuyo tema es [SPACE](https://medium.com/js13kgames/js13kgames-2021-has-started-aa9345fd9fdf).

En está competencia existe la categoría de [server](https://github.com/js13kGames/js13kserver), en la cual se entrega un proyecto el cual ya tiene configurado lo necesario para establecer una conexión en tiempo real, en este caso haciedo uso de la popular librería conocida como [socket.io](https://socket.io/), 
la idea es que el juego comprimido en un acrhivo .zip no supere los 13KB, para este juego el archivo que contiene todo el juego y que pesa 13 KB, es el denominado [dist.zip](https://github.com/Jorger/Space4/blob/main/dist.zip), los archivos comprimidos está ubicados en la carpeta [public](https://github.com/Jorger/Space4/tree/main/public), 
de la misma forma los archivos no comprimidos del juego se encuetran en la carpeta [public_uncompressed](https://github.com/Jorger/Space4/tree/main/public_uncompressed)

## 📖 Reglas.

![rules](https://user-images.githubusercontent.com/30050/132253862-68a2c735-48ca-4069-89b4-c993cfc0c512.png)

* En un turno, un jugador toca una columna para dejar caer un "meteoro".
* Los jugadores se turnan para colocar meteoros hasta que cada jugador obtenga cuatro de sus meteoros en una fila, columna o diagonal.
* Cuando hay cuatro meteoros del mismo color seguidas, ese jugador gana!

## 🎮 Modalidades de Juego.

https://user-images.githubusercontent.com/30050/132251551-adf63d32-32f9-4c0c-84ae-928308ea36b9.mov

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

https://user-images.githubusercontent.com/30050/132251813-7c1fe309-de4a-44fb-887f-cae6e4baf36b.mov

En esta modalidad se competirá vs un bot, es una modalidad que también sirve como práctica, a la vez se cuenta con tres modos de dificultad.

## 2️⃣ Online.

Está modalidad requiere conexión a internet, ya que se hará uso de [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), se tienen las siguientes opciones:

### 🌎 Play Online


![online](https://user-images.githubusercontent.com/30050/132252445-30e41cbc-3770-4700-bf27-b27b9de5e791.gif)

Esta modalidad nos permitirá inciar una partida con cualquier jugador que este conectado, se podría intepretar como una partida aleatoria, ya que se creará una sala con aquella persona que este disponible en ese momento, en esta partida además se encuenta con la opción de tener un "chat", para así darle un toque social al juego, cada uno usuario tiene 15 segundos para realizar su movimiento, si no lo hace en este lapso de tiempo se hará un lanzamiento aleatorio.


### 🤝 Play with friends

![friends](https://user-images.githubusercontent.com/30050/132252679-054f326c-74b3-4abe-bb82-23d921fb9429.gif)


Es una extensión de la modalidad anterior, pero en este caso se creará una sala privada, es decir, sólo aquellos usuarios que tengan el código de la sala podrán jugar la partida, 
se aplican las mismas funcionalidades de la modalidad anterior, contando con el mismo tiempo de lanzamiento y la capacidad de interactuar por medio de emojis.

En dispositivos móviles (y en algunos browsers en desktop) el usuario podrá usar la opción de [share nativa](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share), para compartir la url de la sala.

## 🏃‍♂️ Ejecución.

Este proyecto es un fork del [proyecto original](https://github.com/js13kGames/js13kserver) creado para está categoría, en este caso se requiere de NodeJS.

### Instalación de dependencias.

```
npm i
```

### Ejecución del proyecto

```
npm run start:dev
```

En este caso se el proyecto correrá en http://localhost:3000/

**Nota:**

Se recomiendo renombrar la carpeta `public_uncompressed` a `public` y ésta última ponerle otro nombre, para así ver los archivos sin compresión.


## 📦 Compresión de archivos.

Se utilizarán los siguientes herramientas para comprimir los archivos:

* https://xem.github.io/terser-online/
* https://csscompressor.com/
* https://tinypng.com/
* https://javascript-minifier.com/

## 🔈 Sonidos.

Para los sonidos se uzó la librería [ZzFX](https://github.com/KilledByAPixel/ZzFX), la cual es una de las recomendadas entre los [recursos](https://js13kgames.github.io/resources/) de la competencia

# 👨🏻‍💻 Autor

* Jorge Rubiano 
[@ostjh](https://twitter.com/ostjh)
