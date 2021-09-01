"use strict";
let availableUsers = [];
const rooms = [];

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {
  io: (socket) => {
    /**
     * Evento para un nuevo usuario
     */
    socket.on(
      "newUser",
      ({ type = "online", friendRoom = "", player = {} }, callback) => {
        // let room = "";
        console.log({ type, friendRoom, player });
        // Traer los usuarios que estén disponibles
        // Se filtrará que no permita al mismo usuario
        const filteredAvailableUsers = availableUsers.filter(
          (v) => v.type === type && v.player.token !== player.token
        );

        console.log("filteredAvailableUsers");
        console.log(filteredAvailableUsers);

        if (filteredAvailableUsers.length !== 0) {
          // Hay usuarios dipsonibles para jugar....
          const indexPartner = randomNumber(
            0,
            filteredAvailableUsers.length - 1
          );
          const startColor = randomNumber(0, 1);
          const newRoom = availableUsers[indexPartner].room;
          const partner = availableUsers[indexPartner].player;
          const playerStartsGame = randomNumber(1, 2);
          console.log({ indexPartner });
          // Ya se tiene la información del segundo jugador...
          const gameData = {
            room: newRoom,
            playerStartsGame:
              playerStartsGame === 1 ? partner.token : player.token,
            p1: {
              ...partner,
              color: startColor + 1,
            },
            p2: {
              ...player,
              id: socket.id,
              color: +!startColor + 1,
            },
          };

          socket.join(newRoom);

          rooms.push(gameData);
          console.log(gameData);
          const indexRoom = rooms.findIndex((v) => v.room === newRoom);
          console.log("EL INDEX DLE PLAYER QUE SE VA");
          console.log({ indexRoom });
          availableUsers.splice(indexRoom, 1);
          io.sockets.in(newRoom).emit("startGame", gameData);
        } else {
          // Se guardará el usuario en el lstado de usuarios disponibles...
          // availableUsers.push(player);
          const room = type === "online" ? guid() : friendRoom;

          availableUsers.push({
            room,
            type,
            player: {
              ...player,
              id: socket.id,
            },
          });
          socket.join(room);
        }

        callback();
      }
    );

    socket.on("action", (data) => {
      // drop -> realiza lanzamiento de un elemento

      // Indica que el juego terminó
      // if (data.type === 4) {
      //   const indexRoom = rooms.findIndex((v) => v.room === data.room);
      //   if (indexRoom >= 0) {
      //     // Se elimina la sala así se evita que cuando se desconecten los usuarios
      //     // se emita el mensaje de desconexión
      //     rooms.splice(indexRoom, 1);
      //   }
      // }

      io.sockets.in(data.room).emit(data.type, data);
    });

    /**
     * Evento para indicar que un jugador se ha desconectado
     */
    socket.on("disconnect", () => {
      // Buscar la sala a la cual pertenece este socket
      // Se debería validar después si es un boarda/table para el party mode
      console.log("se desconecta un usuario");
    });
  },
};
