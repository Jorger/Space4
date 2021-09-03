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
      (
        { type = "online", friendRoom = "", createRoom = false, player = {} },
        callback
      ) => {
        // Primero validar el tipo de conexión...
        // Traer los usuarios que estén disponibles
        // Se filtrará que no permita al mismo usuario
        const filteredAvailableUsers = availableUsers.filter(
          (v) => v.type === type && v.player.token !== player.token
        );

        if (
          (filteredAvailableUsers.length !== 0 && !createRoom) ||
          (type === "friend" && !createRoom)
        ) {
          // Si es de tipo jugar con amigos, se debe buscar que exista la sala...
          let indexPartner = -1;

          if (type === "online") {
            // Hay usuarios dipsonibles para jugar....
            indexPartner = randomNumber(0, filteredAvailableUsers.length - 1);
          }

          if (type === "friend") {
            indexPartner = filteredAvailableUsers.findIndex(
              (v) => v.room === friendRoom
            );

            // Si existe la sala
            if (indexPartner < 0) {
              return callback("The room does not exist");
            }
          }

          if (indexPartner < 0) {
            return callback("The type of game is not valid");
          }

          const startColor = randomNumber(0, 1);
          const newRoom = availableUsers[indexPartner].room;
          const partner = availableUsers[indexPartner].player;
          const playerStartsGame = randomNumber(1, 2);
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
          const indexRoom = availableUsers.findIndex((v) => v.room === newRoom);
          availableUsers.splice(indexRoom, 1);
          io.sockets.in(newRoom).emit("startGame", gameData);
        } else {
          // Se guardará el usuario en el lstado de usuarios disponibles...
          const room = String(type === "online" ? guid() : friendRoom);

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
      io.sockets.in(data.room).emit("action", data);
    });

    /**
     * Evento para indicar que un jugador se ha desconectado
     */
    socket.on("disconnect", () => {
      // Buscar la sala a la cual pertenece este socket
      const indexRoom = rooms.findIndex(
        ({ p1, p2 }) => p1.id === socket.id || p2.id === socket.id
      );

      if (indexRoom >= 0) {
        // Se emite al jugador que quedó que se ha desconectado el otro jugador
        io.sockets.in(rooms[indexRoom].room).emit("playerDisconnect");
        // Se elimina la sala
        rooms.splice(indexRoom, 1);
      } else {
        // Buscar en el listado de usuarios pendientes a jugar
        const indexPlayer = availableUsers.findIndex(
          ({ player }) => player.id === socket.id
        );

        // Se saca al usuario del listado de jugadores disponibles
        if (indexPlayer >= 0) {
          availableUsers.splice(indexPlayer, 1);
        }
      }
    });
  },
};
