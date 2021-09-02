"use strict";

(() => {
  // Utilidades
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const BASE_HEIGHT = 732;
  const BASE_WIDTH = 412;
  const METEOR_SIZE = 50;
  const BASE_POSITION = METEOR_SIZE * 0.18;
  const NUM_ROWS = 6;
  const NUM_COLS = 7;
  const MAX_METEORITES = 4;
  const AVATARS = [
    "👩‍🚀",
    "👩🏽‍🚀",
    "👨‍🚀",
    "👩🏻‍🚀",
    "👨🏼‍🚀",
    "👩🏼‍🚀",
    "👩🏾‍🚀",
    "👨🏽‍🚀",
    "👨🏻‍🚀",
    "👨🏿‍🚀",
    "👩🏿‍🚀",
    "👨🏾‍🚀",
  ];
  const METEOR_COLORS = ["blue", "red"];
  const CHAT_MESSAGES = {
    msg: [
      "TODAY IS YOUR DAY",
      "WELL PLAYED",
      "GOOG GAME",
      "TODAY IS MY DAY",
      "NICE MOVE",
      "HEHEHEHE",
      "OOPS!",
      "THANKS",
      "PLAY FAST",
      "HI",
      "YEAH",
      "UNLUCKY",
    ],
    emoji: ["😝", "🤓", "😟", "👊", "👍", "😨", "😂", "😭", "🥰", "🤬"],
  };
  const CACHE_KEY = "space-four";
  let socket;
  let connectedSocket = false;
  // Utilidades
  $(
    "html"
  ).style.cssText += `--h: ${BASE_HEIGHT}px; --w: ${BASE_WIDTH}px; --turn: red;`;
  const setHtml = (element, html) => (element.innerHTML = html);
  const ObjectKeys = (obj) => Object.keys(obj);

  /**
   * Guadar la información dada en localStorage/sessionStorage
   * @param {*} data
   */
  const saveCache = (data, storageType = "localStorage") => {
    window[storageType].setItem(CACHE_KEY, JSON.stringify(data));
  };

  /**
   * Obtener la data que está guardarda en localStorage/sessionStorage
   */
  const getDataCache = (storageType = "localStorage") => {
    const data = window[storageType].getItem(CACHE_KEY) || "";
    return data !== "" ? JSON.parse(data) : {};
  };

  /**
   * Guarda valores de una propiedad en localstorage
   * @param {*} property
   * @param {*} value
   */
  const savePropierties = (property, value, storageType = "localStorage") => {
    const localCache = getDataCache(storageType);
    localCache[property] = value;
    saveCache(localCache, storageType);
  };

  /**
   * Dada una propiedad, devuelve la información de la misma
   */
  const getValueFromCache = (
    key = "",
    initial,
    storageType = "localStorage"
  ) => {
    const localCache = getDataCache(storageType);
    return localCache[key] || initial;
  };

  /**
   * Para edicioar eventos
   * @param {*} target
   * @param {*} type
   * @param {*} callback
   * @param {*} parameter
   */
  const $on = (target, type, callback, parameter = {}) => {
    if (target) {
      target.addEventListener(type, callback, parameter);
    }
  };

  /**
   * Función que detcta cuando un evento de tipo transitionend termina
   * @param {*} target
   * @param {*} callback
   * @returns
   */
  const onRest = (target, callback) =>
    $on(target, "transitionend", (evt) => callback(evt));

  /**
   * Agrega una clase a un elemento
   * @param {*} target
   * @param {*} className
   */
  const addClass = (target, className) => {
    if (target) {
      className.split(" ").forEach((classText) => {
        target.classList.add(classText);
      });
    }
  };

  const removeClass = (target, className) => {
    if (target) {
      className.split(" ").forEach((classText) => {
        target.classList.remove(classText);
      });
    }
  };

  /**
   * Determina si el dispotivo es mobile
   */
  const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  /**
   * Agregar estilos inline a un elemento
   * @param {*} target
   * @param {*} styles
   */
  const addStyle = (target, styles) => {
    if (target) {
      for (let style in styles) {
        target.style[style] = styles[style];
      }
    }
  };

  /**
   * Función que aplica estilos en line a un elemento
   * @param {*} styles
   * @returns
   */
  const inlineStyles = (styles) =>
    ObjectKeys(styles).length
      ? `style='${ObjectKeys(styles)
          .map((v) => `${v}:${styles[v]}`)
          .join(";")}'`
      : "";

  /**
   * Para establecer un tiempo para hacer una acción en una función
   * útil para el evento de resize
   * @param {*} fn
   * @param {*} delay
   */
  const debounce = (fn, delay) => {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, delay);
    };
  };

  /**
   * Retonará las dimnesiones de la pantalla
   */
  const getDimensionsScreen = () => ({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  const onWindowResize = debounce(() => {
    const { w, h } = getDimensionsScreen();
    const scale = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT);
    const mobile = isMobile();
    addStyle($("body"), {
      zoom: `${w < BASE_WIDTH ? Math.round((w / BASE_WIDTH) * 100) : 100}%`,
      transform:
        scale >= 1 || mobile ? `scale(${!mobile ? scale : 1})` : undefined,
    });
  }, 50);

  /**
   * Función que crea un array para la grilla
   * @param {*} callback
   * @returns
   */
  const createGrid = (callback) =>
    new Array(NUM_ROWS)
      .fill(null)
      .map((_, c) =>
        new Array(NUM_COLS).fill(null).map((_, f) => callback(c, f))
      );

  /**
   * Dado el index del color, devolver el filtro que establecerá su color
   * @param {*} index
   * @returns
   */
  const setColorMeteor = (index) =>
    `brightness(40%) sepia(100%) hue-rotate(${
      index === 1 ? 183 : -50
    }deg) saturate(600%)`;

  const generateLink = (label = "", url = "") =>
    `<a title=${label} href=${url} target="_blank" rel="noopener noreferrer">${label}</a>`;

  /**
   * Retorna los datos del usuario...
   * @returns
   */
  const getPlayer = () => ({
    name: getValueFromCache("name", ""),
    avatar: getValueFromCache("avatar", 0),
    token: getValueFromCache("token", ""),
  });

  // fin de utilidades

  /**
   * Componente que renderizará un meteoro...
   * @param {*} param0
   * @returns
   */
  const Meteor = ({ style = {}, id = "" }) =>
    `<meteor ${id ? `id=${id} ` : ""}${inlineStyles(style)}></meteor>`;

  /**
   * Componente que muestra los hoyos que tiene el board
   * @returns
   */
  const BoardHoles = () =>
    `<holes class=wh ${inlineStyles({
      "-webkit-mask-image": `radial-gradient(transparent 50%, #fff 50%)`,
      "-webkit-mask-size": `${METEOR_SIZE}px ${METEOR_SIZE}px`,
      "-webkit-mask-position": `${METEOR_SIZE}px ${METEOR_SIZE}px`,
    })}>
      ${new Array(NUM_COLS)
        .fill(null)
        .map(
          (_, i) =>
            `<button id='h-${i}' ${inlineStyles({
              width: `${METEOR_SIZE}px`,
            })}></button>`
        )
        .join("")}
    </holes>`;

  /**
   * Renderiza el board base del juego
   * También renderizará los meteoros
   * @returns
   */
  const Board = () =>
    `<board ${inlineStyles({
      width: `${METEOR_SIZE * NUM_COLS}px`,
      height: `${METEOR_SIZE * NUM_ROWS}px`,
    })}>
      ${BoardHoles()}
      ${createGrid((c, f) =>
        Meteor({
          id: `m-${f + c * NUM_COLS}`,
          style: {
            width: `${METEOR_SIZE * 0.63}px`,
            height: `${METEOR_SIZE * 0.63}px`,
            visibility: "hidden",
          },
        })
      )
        .map((v) => v.join(""))
        .join("")}
    </board>`;

  /**
   * Renderiza el espacio de lo jugadores
   * @param {*} players
   * @returns
   */
  const Gamers = (
    players = [],
    isOnline = false
  ) => `<div class=cs ${inlineStyles({
    width: "100%",
    margin: "30px 0",
  })}>
    ${players
      .map(
        (player, index) => `<div ${inlineStyles({
          width: "100%",
          display: "flex",
          "justify-content": "center",
          "flex-direction": "column",
          "align-items": "center",
          position: "relative",
        })} id=player-${index + 1}>
          ${
            isOnline
              ? `
            <svg class="progress-ring" width="120" height="120" ${inlineStyles({
              position: "absolute",
              "z-index": 1,
              top: "11px",
              transform: "scale(0.7)",
            })}>
              <circle class="progress-ring__circle" stroke="${
                METEOR_COLORS[player.color - 1]
              }" stroke-width="12" fill="transparent" r="52" cx="60" cy="60"/>
            </svg>
            <bubble class=cs></bubble>
            `
              : ""
          }
          ${AvatarName({
            name: player.name,
            styles: {
              "margin-bottom": "10px",
              "font-size": "18px",
            },
          })}
          ${AvatarImage({
            image: player.image,
            styles: {
              width: "70px",
              height: "70px",
              "font-size": "3.5rem",
            },
          })}
        <div class=cs>
          ${Meteor({
            style: {
              filter: setColorMeteor(player.color),
              width: "20px",
              height: "20px",
              position: "relative",
              "margin-top": "10px",
              animation: "cr 3s infinite linear",
            },
          })}
          <div class=score>0</div>
        </div>
      </div>`
      )
      .join("")}
    </div>`;

  /**
   * Renderiza el modal del juego
   */
  const Modal = {
    show({ txt, icon = "", yes = "yes", no = "no", cb }) {
      $("modal .txt").innerHTML =
        (icon
          ? `<p ${inlineStyles({ "font-size": "3rem" })}>${icon}</p>`
          : "") + txt;
      addStyle($("modal #btn1"), { display: yes ? "block" : "none" });
      addStyle($("modal #btn2"), { display: no ? "block" : "none" });
      $("modal #btn1").textContent = yes;
      $("modal #btn2").textContent = no;
      removeClass($("modal"), "hide");
      addClass($("modal"), "show");
      this.callback = cb;
    },
    hide() {
      removeClass($("modal"), "show");
      addClass($("modal"), "hide");
    },
    render: () =>
      `<modal class="hide wh"><div class="ms wh"></div><div class="mw wh cs"><div class=mc><div class="wh cs txt"></div><div class="mb wh cs"><button id=btn1></button><button id=btn2></button></div></div></div></modal>`,
    events() {
      $$("modal button").forEach((btn) =>
        $on(btn, "click", (e) => {
          this.hide();
          this.callback && this.callback(e.target.id === "btn1");
        })
      );
    },
  };

  /**
   * Renderiza el componente del chat...
   * @returns
   */
  const Chat = () =>
    `<chat ${inlineStyles({
      "margin-top": "30px",
      position: "relative",
      "z-index": 1,
    })}><div class=chat>${ObjectKeys(CHAT_MESSAGES)
      .map(
        (opt) =>
          `<div class=chat-${opt}>${CHAT_MESSAGES[opt]
            .map((v, i) => `<button id="${opt}-${i}">${v}</button>`)
            .join("")}</div>`
      )
      .join("")}</div><button class=button>Chat</button></chat>`;

  /**
   * Renderiza la pantalla del juego
   * @param {*} options
   */
  const Game = (options) => {
    const {
      isTwoPlayers = false,
      isBot = "",
      numMeteorites = MAX_METEORITES,
      isOnline = {},
    } = options;
    const currentPlayer = getPlayer();
    // Determina si es una partida offline, bien por que sean dos juagdores y por que es versus un bot
    const isOffline = !!(isTwoPlayers || isBot);
    // La grila dle juego...
    let GRID = createGrid(() => []);
    // El contador de meteoros que se va mostrando en la pantalla.
    let meteorCounter = 0;
    // Determina si una animación se está ejecuatando...
    let animationOn = false;
    // Se debe determinar que jugar inicia la partida, esta variable cambiará, cada vez que se reinicie el juego
    // Cuando sea online a está variable le llegará el usuario que inició la partida...
    let playerStartsGame = isOffline
      ? randomNumber(1, 2)
      : isOnline.playerStartsGame === currentPlayer.token
      ? 1
      : 2;
    // Para el color del meteoro que se está lanzando
    // INCIALMENTE ES EL MISMO COLOR QUE playerStartsGame
    let playerHasTurn = playerStartsGame;
    // Variable que indica si se debe o no deshabilitar la ui
    // Si inicia el bot debe estar bloqueado, si en la versión online inicia el otro jugador también debe estar bloqueado
    // Está variable se debe reiniciar cada vez que se reinice el juego
    let disableUI = isOffline
      ? !isTwoPlayers
        ? playerStartsGame === 2
        : false
      : playerStartsGame === 2;
    // Para crear el orden de validación de los posibles movimientos de la "IA"
    const orderPossibleConnections = [];

    // Para generar la data de los jugadores...
    // Por defecto el jugador uno es el actual
    const PLAYER_DATA = [
      {
        name: currentPlayer.name,
        image: AVATARS[currentPlayer.avatar],
        color: isOffline ? randomNumber(1, 2) : isOnline.color,
        token: currentPlayer.token,
        score: 0,
      },
    ];

    PLAYER_DATA.push({
      name: isOffline ? (isTwoPlayers ? "Guest" : "Mr. Bot") : isOnline.p2.name,
      image: isOffline
        ? isTwoPlayers
          ? "👽"
          : "🤖"
        : AVATARS[isOnline.p2.avatar],
      color: isOffline
        ? PLAYER_DATA[0].color === 1
          ? 2
          : 1
        : isOnline.p2.color,
      token: !isOffline ? isOnline.p2.token : "",
      score: 0,
    });

    if (isOffline && isBot) {
      // Genera el orden de las posibles combinaciones para la "IA"
      for (let counter = numMeteorites - 1; counter >= 1; counter--) {
        orderPossibleConnections.push(
          { c: METEOR_COLORS[PLAYER_DATA[1].color - 1], i: counter },
          { c: METEOR_COLORS[PLAYER_DATA[0].color - 1], i: counter }
        );
      }
    }

    // Guardará las conexiones que están cerca a cumplirse
    // útil para la IA
    let possibleConnections = {};
    // Para guardar el intervalo online
    let intervalOnline;
    // Fallback si la animación no se ejecuta
    let intervalFallbackAnimation;
    let runFallback = false;
    /*
    1 es azul
    2 es rojo
    */

    /**
     * Limpiar los intervalos del juego
     */
    const clearIntervals = () => {
      if (intervalOnline) {
        clearInterval(intervalOnline);
      }

      if (intervalFallbackAnimation) {
        clearTimeout(intervalFallbackAnimation);
      }

      for (let i = 0; i < PLAYER_DATA.length; i++) {
        if (PLAYER_DATA[i].interval) {
          clearTimeout(PLAYER_DATA.interval);
        }
      }
    };

    /**
     * Muestra el mensaje del chat...
     * @param {*} type
     * @param {*} value
     * @param {*} playerNumber
     */
    const showMessage = (type = "", value = 0, playerNumber = 1) => {
      const bubble = $(`#player-${playerNumber} bubble`);
      bubble.innerHTML = CHAT_MESSAGES[type][value];
      addClass(bubble, "show");
      addStyle(bubble, {
        "font-size": type === "msg" ? "14px" : "2em",
      });

      if (PLAYER_DATA[playerNumber - 1].interval) {
        clearTimeout(PLAYER_DATA[playerNumber - 1].interval);
      }

      PLAYER_DATA[playerNumber - 1].interval = setTimeout(() => {
        removeClass(bubble, "show");
      }, 2000);
    };

    const setLaunchTimer = (playerNumber = 1, startCounter = true) => {
      // Establecer el intervalo para el lanzamiento
      let counterTmp = 100;
      const circle = $(`#player-${playerNumber} circle`);
      const radius = circle.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = `${circumference}`;

      const setProgress = (percent) => {
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
      };

      setProgress(counterTmp);

      if (intervalOnline) {
        clearInterval(intervalOnline);
      }

      if (startCounter) {
        intervalOnline = setInterval(() => {
          setProgress(counterTmp);
          counterTmp--;
          if (counterTmp < 0) {
            clearInterval(intervalOnline);
            // Se debe hacer el lanzamiento aleatorio
            if (playerNumber === 1) {
              const randomMove = getRandomMove();
              selectedColumn(randomMove, PLAYER_DATA[playerNumber - 1].color);
            }
          }
        }, 150);
      }
    };

    /**
     * Función que valida el siguiente movimiento
     * En está función, también se determina si se ha hecho la conexión
     * @param {*} response
     */
    const validateEndsMovement = (response) => {
      const showModal = {
        show: false,
        txt: "",
      };

      // Guarda los posibles movimientos
      // útil para la validación de tipo IA
      if (ObjectKeys(response.posible).length) {
        const color = METEOR_COLORS[PLAYER_DATA[playerHasTurn - 1].color - 1];

        if (!possibleConnections[color]) {
          possibleConnections[color] = {};
        }

        // Iterar sobre todos los posibles...
        for (let counter = numMeteorites - 1; counter >= 1; counter--) {
          const possibleKey = `c-${numMeteorites - counter}`;

          if (!possibleConnections[color][possibleKey]) {
            possibleConnections[color][possibleKey] = [];
          }

          if (response.posible[possibleKey].length) {
            possibleConnections[color][possibleKey] = [
              ...new Set(
                [
                  ...possibleConnections[color][possibleKey],
                  ...response.posible[possibleKey],
                ].map((v) => `${v[0]}${v[1]}`)
              ),
            ].map((v) => v.split("").map((n) => +n));
          }
        }
      }

      if (!response.connect) {
        // Se debe validar si hay slots disponibles...
        if (getAvailableSlots().length !== 0) {
          animationOn = false;
          meteorCounter++;
          playerHasTurn = playerHasTurn === 1 ? 2 : 1;
          disableUI = isOffline
            ? !!(isBot && playerHasTurn === 2)
            : playerHasTurn === 2;
          showPlayerTurn();
        } else {
          showModal.show = true;
          showModal.icon = "🤝";
          showModal.txt = `<h2>Tied game</h2><p>Do you want to play again?</p>`;
        }
      } else {
        // En esta parte se muestra quien ganó
        // Primero resaltar los meteoritos gaaradores...
        const winningMeteorites = response.meteorites.map(
          (v) => GRID[v[0]][v[1]][1]
        );

        for (let i = 0; i <= meteorCounter; i++) {
          addStyle(
            $(`#m-${i}`),
            winningMeteorites.includes(i)
              ? {
                  animation: `beat 2s ease-out infinite`,
                  "z-index": 1,
                }
              : {
                  opacity: ".5",
                }
          );
        }

        PLAYER_DATA[playerHasTurn - 1].score += 1;
        $(`#player-${playerHasTurn} .score`).innerHTML =
          PLAYER_DATA[playerHasTurn - 1].score;

        showModal.show = true;
        showModal.icon = PLAYER_DATA[playerHasTurn - 1].image;
        showModal.txt = `<h2>${
          PLAYER_DATA[playerHasTurn - 1].name
        } has won</h2><p>Do you want to play again?</p>`;
      }

      if (showModal.show) {
        clearIntervals();
        Modal.show({
          ...showModal,
          cb(answer) {
            if (isOffline) {
              answer ? resetGame() : Screen();
            } else {
              if (answer) {
                // Enviar un socket para preguntar si se desea jugar de nuevo...
                socket.emit("action", {
                  type: "playAgain",
                  room: isOnline.room,
                  currentPlayer,
                });

                Modal.show({
                  icon: "⏳",
                  txt: `<h2 ${inlineStyles({
                    "text-align": "center",
                  })}>Waiting for opponent's response</h2>`,
                  no: "",
                  yes: "Cancel",
                  cb() {
                    disconnectSocket();
                    Screen();
                  },
                });
              } else {
                disconnectSocket();
                Screen();
              }
            }
          },
        });
      }
    };

    /**
     * Valida si una coordenada está dentro del escenario
     * @param {*} row
     * @param {*} col
     * @returns
     */
    const coordinateOnStage = (row, col) =>
      row >= 0 && row < NUM_ROWS && col >= 0 && col < NUM_COLS;

    /**
     * Función que valida si se ha logrado conectar los meteoros
     * También devuelve potenciales movimientos para evitar la conexión, útil para la "IA"
     * @param {*} position
     * @returns
     */
    const validateMeteorConnection = (position) => {
      const row = +position[0];
      const col = +position[1];
      const currentColor = GRID[row][col][0];
      const possibleLines = { v: [[row, col]] };
      // Guarda las posiciones posibles de conexión...
      const posible = {};

      // Dada la posición, se busca si existe 4 o tres elementos del mismo color (horizontal, diagonal y vertical)
      // Si hay 4 elementos se indica que ha ganado y se devuleve un array con las posiciones de los elementos
      // Si es 3 igualmente se devuleve, para así ayudar a inferior al IA

      // Primero en vertical...
      for (let i = row + 1; i < NUM_ROWS; i++) {
        if (GRID[i][col][0] === currentColor) {
          possibleLines.v.push([i, col]);

          if (possibleLines.v.length === numMeteorites) {
            return {
              connect: true,
              posible,
              meteorites: possibleLines.v,
            };
          }
        } else {
          break;
        }
      }

      // Ahora buscar en horizontal...
      possibleLines.h = [[row, col]];
      for (let times = 1; times <= 2; times++) {
        let newCol = col + (times === 1 ? -1 : 1);
        do {
          if (
            coordinateOnStage(row, newCol) &&
            GRID[row][newCol][0] === currentColor
          ) {
            possibleLines.h.push([row, newCol]);
            newCol += times === 1 ? -1 : 1;

            if (possibleLines.h.length === numMeteorites) {
              return {
                connect: true,
                posible,
                meteorites: possibleLines.h,
              };
            }
          } else {
            break;
          }
        } while (1);
      }

      // Para validar las diagonales
      for (let diagonal = 1; diagonal <= 2; diagonal++) {
        const key = diagonal === 1 ? "id" : "di";
        possibleLines[key] = [[row, col]];

        for (let times = 1; times <= 2; times++) {
          const increments = {
            col: diagonal === 1 ? (times === 1 ? -1 : 1) : times === 1 ? 1 : -1,
            row: times === 1 ? -1 : 1,
          };

          let newCol = col + increments.col;
          let newRow = row + increments.row;

          do {
            if (
              coordinateOnStage(newRow, newCol) &&
              GRID[newRow][newCol][0] === currentColor
            ) {
              possibleLines[key].push([newRow, newCol]);
              newRow += increments.row;
              newCol += increments.col;

              if (possibleLines[key].length === numMeteorites) {
                return {
                  connect: true,
                  posible,
                  meteorites: possibleLines[key],
                };
              }
            } else {
              break;
            }
          } while (1);
        }
      }

      // Si llega a este punto, es que no existe ninguna coincidencia
      // Por lo tanto se devolverá las cercanas...
      // Sólo se ejecuta si es un bot, además que el nivel del juego sea medium or hard
      if (isBot && (isBot === "medium" || isBot === "hard")) {
        for (let counter = numMeteorites - 1; counter >= 1; counter--) {
          const possibleKey = `c-${numMeteorites - counter}`;
          posible[possibleKey] = [];

          // Para horizontal
          if (possibleLines.h.length === numMeteorites - counter) {
            const posibleHorizontal = possibleLines.h.map((v) => v[1]).sort();
            const limits = {
              left: posibleHorizontal[0] - 1,
              right: posibleHorizontal[posibleHorizontal.length - 1] + 1,
            };

            for (let times = 1; times <= 2; times++) {
              const key = times === 1 ? "left" : "right";

              if (
                coordinateOnStage(row, limits[key]) &&
                GRID[row][limits[key]].length === 0
              ) {
                posible[possibleKey].push([row, limits[key]]);
              }
            }
          }

          if (possibleLines.v.length === numMeteorites - counter) {
            const topLimit = possibleLines.v[0][0] - 1;

            if (
              coordinateOnStage(topLimit, col) &&
              GRID[topLimit][col].length === 0
            ) {
              posible[possibleKey].push([topLimit, col]);
            }
          }

          // Para las diagonales...
          for (let diagonal = 1; diagonal <= 2; diagonal++) {
            const key = diagonal === 1 ? "id" : "di";

            if (possibleLines[key].length === numMeteorites - counter) {
              const posibleDiagonal = possibleLines[key].sort(
                (a, b) => a[0] - b[0]
              );

              for (let times = 1; times <= 2; times++) {
                const limits =
                  posibleDiagonal[times === 1 ? 0 : posibleDiagonal.length - 1];

                const newRow = limits[0] + (times === 1 ? -1 : 1);
                const newCol =
                  limits[1] +
                  (diagonal === 1
                    ? times === 1
                      ? -1
                      : 1
                    : times === 1
                    ? 1
                    : -1);

                if (
                  coordinateOnStage(newRow, newCol) &&
                  GRID[newRow][newCol].length === 0
                ) {
                  posible[possibleKey].push([newRow, newCol]);
                }
              }
            }
          }
        }
      }

      return {
        connect: false,
        posible,
      };
    };

    /**
     * Función que captura la columna seleccionada en el board
     * @param {*} index
     */
    const selectedColumn = (index = 0, color = 1) => {
      // Primero determinar la posición a donde llegaría el meteoro,
      // dependiendo de los valores qu existan en la grilla...
      const newPosition =
        GRID.map((v) => v[index]).filter((v) => !v.length).length - 1;

      if (animationOn || newPosition < 0) return;
      $("#turn").innerHTML = "...";

      const newMeteor = $(`#m-${meteorCounter}`);
      // Guarda el color en la grilla
      GRID[newPosition][index] = [color, meteorCounter];
      // Guardar atributos en el elemento
      newMeteor.setAttribute("p", `${newPosition}-${index}`);
      // Establecer la posición inicial...
      addStyle(newMeteor, {
        left: `${BASE_POSITION + METEOR_SIZE * index}px`,
        top: `${(METEOR_SIZE + BASE_POSITION) * -1}px`,
        filter: setColorMeteor(color),
        visibility: "visible",
        animation: "cr 5s infinite linear",
      });

      // Interrupción para indicar la posición de llegada
      setTimeout(() => {
        if (newMeteor) {
          addStyle(newMeteor, {
            top: `${BASE_POSITION + METEOR_SIZE * newPosition}px`,
          });
        }
      }, 100);

      // Establece que se está haciendo una animación de movimiento
      animationOn = true;

      if (!isOffline) {
        setLaunchTimer(playerHasTurn, false);

        if (playerHasTurn === 1) {
          socket.emit("action", {
            type: "drop",
            currentPlayer,
            room: isOnline.room,
            index,
            color,
          });
        }
      }

      // Por si la animación no termina
      runFallback = false;
      if (intervalFallbackAnimation) {
        clearTimeout(intervalFallbackAnimation);
      }

      intervalFallbackAnimation = setTimeout(() => {
        runFallback = true;
        if (newMeteor) {
          addStyle(newMeteor, {
            top: `${BASE_POSITION + METEOR_SIZE * newPosition}px`,
          });
        }

        validateEndsMovement(validateMeteorConnection([newPosition, index]));
      }, 2000);
    };

    /**
     * Función que resalta que usuario tiene el turno
     */
    const showPlayerTurn = () => {
      document.documentElement.style.setProperty(
        "--turn",
        METEOR_COLORS[PLAYER_DATA[playerHasTurn - 1].color - 1]
      );
      const opposite = playerHasTurn === 1 ? 2 : 1;
      addClass($(`#player-${playerHasTurn} avatar-image`), "blink");
      removeClass($(`#player-${opposite} avatar-image`), "blink");

      $("#turn").innerHTML =
        playerHasTurn === 1 ? "You turn" : "Opponent's turn";

      if (isBot && playerHasTurn === 2) {
        botTurn();
      }

      // Para reiniciar el contador de lanzamiento del juego
      if (!isOffline) {
        setLaunchTimer(playerHasTurn);
      }
    };

    /**
     * Función que indica que slots de la matriz están disponibles
     */
    const getAvailableSlots = () => {
      const available = [];

      for (let i = 0; i < NUM_COLS; i++) {
        let counter = 0;
        for (let c = 0; c < NUM_ROWS; c++) {
          counter += +(GRID[c][i].length === 0);
        }

        if (counter !== 0) {
          available.push(i);
        }
      }

      return available;
    };

    /**
     * Función que retorna un movimiento aleatorio para el juego
     */
    const getRandomMove = () => {
      const availableSlots = getAvailableSlots();
      return availableSlots[randomNumber(0, availableSlots.length - 1)];
    };

    /**
     * Función que valida si un meteoro tiene una base
     * @param {*} row
     * @param {*} col
     * @returns
     */
    const validateMeteorBase = (row, col) =>
      row + 1 === NUM_ROWS ? true : GRID[row + 1][col].length !== 0;

    /**
     * Función que realiza el lanzamiento de un bot
     */
    const botTurn = debounce(() => {
      let positionIndex = getRandomMove();
      // const playerColor = METEOR_COLORS[PLAYER_DATA[0].color - 1];
      // const botColor = METEOR_COLORS[PLAYER_DATA[1].color - 1];
      let findPossibleMovement = false;
      // Valida si realiza el proceso de predecir el movimiento
      // Si es de tipo medium, será aleatorio
      // En hard siempre buscará hacer la predicción
      const predictsMovement =
        isBot !== "easy"
          ? isBot === "medium"
            ? !!randomNumber(0, 1)
            : true
          : false;

      if (ObjectKeys(possibleConnections).length !== 0 && predictsMovement) {
        for (let item of orderPossibleConnections) {
          if (possibleConnections[item.c]) {
            const positions = possibleConnections[item.c][`c-${item.i}`];
            // Para sacar del listado las posiciones que ya no sirven o que se han usado...
            const removePossibleOptions = [];

            if (positions.length !== 0) {
              for (let i = 0; i < positions.length; i++) {
                // Primero saber si la posición está disponible
                if (GRID[positions[i][0]][positions[i][1]].length === 0) {
                  // Ahora saber si tiene base
                  if (validateMeteorBase(positions[i][0], positions[i][1])) {
                    // Si tiene base...
                    positionIndex = positions[i][1];
                    removePossibleOptions.push(i);
                    findPossibleMovement = true;
                    break;
                  }
                } else {
                  removePossibleOptions.push(i);
                }
              }
            }

            // Eliminar los que ya no son necesarios...
            for (let i = 0; i < removePossibleOptions.length; i++) {
              possibleConnections[item.c][`c-${item.i}`].splice(
                removePossibleOptions[i],
                1
              );
            }

            if (findPossibleMovement) {
              break;
            }
          }
        }
      }

      selectedColumn(positionIndex, PLAYER_DATA[playerHasTurn - 1].color);
    }, 500);

    /**
     * Función que resetea el estado del juego...
     */
    const resetGame = () => {
      // Se reinicia la grilla
      GRID = createGrid(() => []);
      // Ahora reiniciar los meteoritos
      $$("board > meteor").forEach((mt) => {
        mt.style = "";
        addStyle(mt, {
          width: `${METEOR_SIZE * 0.63}px`,
          height: `${METEOR_SIZE * 0.63}px`,
          visibility: "hidden",
        });
      });
      meteorCounter = 0;
      animationOn = false;
      playerStartsGame = playerStartsGame === 1 ? 2 : 1;
      playerHasTurn = playerStartsGame;
      disableUI = isOffline
        ? !isTwoPlayers
          ? playerStartsGame === 2
          : false
        : playerStartsGame === 2;
      possibleConnections = {};
      runFallback = false;
      clearIntervals();
      showPlayerTurn();
    };

    // Renderiza el html del juego
    setHtml(
      $("#render"),
      `<div class='wh cs' ${inlineStyles({
        "flex-direction": "column",
        "z-index": 3,
      })}>
        ${ButtonBack("EXIT", { left: "45%" })}
        ${Gamers(PLAYER_DATA, !isOffline)}
        <div id=turn ${inlineStyles({
          "font-size": "25px",
          "margin-bottom": "30px",
        })}></div>
        ${Board()}
        ${!isOffline ? Chat() : ""}
      </div>`
    );

    // Eventos para el chat
    if (!isOffline) {
      $on($("chat .button"), "click", () => {
        $(".chat").classList.toggle("show");
      });

      $$(".chat button").forEach((btn) => {
        $on(btn, "click", (e) => {
          const value = e.target.id.split("-");
          showMessage(value[0], +value[1]);
          socket.emit("action", {
            type: "chat",
            room: isOnline.room,
            currentPlayer,
            value,
          });

          removeClass($(".chat"), "show");
        });
      });
    }

    // Crear los eventos para el click en los hoyos
    $$("holes > button").forEach((btn) =>
      $on(
        btn,
        "click",
        (e) =>
          !disableUI &&
          selectedColumn(
            +e.target.id.split("-")[1],
            PLAYER_DATA[playerHasTurn - 1].color
          )
      )
    );

    // Para los eventos de los mateoros...
    $$("board > meteor").forEach((mt) =>
      onRest(mt, (e) => {
        if (intervalFallbackAnimation) {
          clearTimeout(intervalFallbackAnimation);
        }

        if (!runFallback) {
          validateEndsMovement(
            validateMeteorConnection(e.target.getAttribute("p").split("-"))
          );
        }
      })
    );

    // Para el evento de regresar
    $on($("#back"), "click", () => {
      Modal.show({
        icon: "⚠️",
        txt: `<h2 ${inlineStyles({
          "margin-bottom": "10px",
        })}>Exit game</h2><p>Are you sure you want to finish the game?</p>`,
        cb(answer) {
          if (answer) {
            // Debe estar sólo cuando sea online
            clearIntervals();
            if (!isOffline) {
              disconnectSocket();
            }
            Screen();
          }
        },
      });
    });

    if (connectedSocket && socket) {
      socket.on("drop", (data) => {
        if (data.currentPlayer.token !== currentPlayer.token) {
          animationOn = false;
          runFallback = false;
          clearIntervals();
          selectedColumn(data.index, data.color);
        }
      });

      socket.on("playerDisconnect", () => {
        clearIntervals();
        disconnectSocket();
        Screen();

        Modal.show({
          icon: "😩",
          txt: `<h2 ${inlineStyles({
            "margin-bottom": "10px",
          })}>User disconnected</h2><p>Your partner has left the room</p>`,
          no: "",
          yes: "Ok",
        });
      });

      socket.on("playAgain", (data) => {
        if (data.currentPlayer.token !== currentPlayer.token) {
          Modal.show({
            icon: "😃",
            txt: `<h2 ${inlineStyles({
              "text-align": "center",
            })}>Your opponent wants to play again</h2>`,
            cb(answer) {
              if (answer) {
                // Se reinicia el juego y se le manda un socket indicando que se acepta
                socket.emit("action", {
                  type: "accept",
                  room: isOnline.room,
                  currentPlayer,
                });
                resetGame();
              } else {
                disconnectSocket();
                Screen();
              }
            },
          });
        }
      });

      socket.on("accept", (data) => {
        if (data.currentPlayer.token !== currentPlayer.token) {
          // Se cierra el modal que se tenga abierto...
          Modal.hide();
          resetGame();
        }
      });

      socket.on("chat", (data) => {
        if (data.currentPlayer.token !== currentPlayer.token) {
          showMessage(data.value[0], +data.value[1], 2);
        }
      });
    }

    showPlayerTurn();
  };

  const ButtonBack = (label = "Back", style = {}) =>
    `<button id=back  ${inlineStyles({
      position: "absolute",
      left: "5%",
      top: "5%",
      "font-size": "20px",
      background: "no-repeat",
      color: "white",
      border: 0,
      cursor: "pointer",
      "font-weight": "bold",
      ...style,
    })}>${label}</button>`;

  /**
   * Renderizará la pantalla de selección de dificultad en modo Bot
   */
  const Difficulty = () => {
    setHtml(
      $("#render"),
      `<div class='cs' ${inlineStyles({ "flex-direction": "column" })}>
        ${ButtonBack()}
        ${Logo()}
        <h2 ${inlineStyles({
          margin: "30px 0",
          "text-align": "center",
          "text-transform": "uppercase",
        })}>CHOOSE DIFFICULTY</h2>
        ${["Easy", "Medium", "Hard"]
          .map(
            (v) =>
              `<button class=button id=${v.toLowerCase()} ${inlineStyles({
                width: "150px",
                "margin-bottom": "20px",
              })}>${v}</button>`
          )
          .join("")}
      </div>`
    );

    $$(".button").forEach((btn) => {
      $on(btn, "click", (e) => {
        Screen("Game", { isBot: e.target.id });
      });
    });

    $on($("#back"), "click", () => Screen());
  };

  const Logo = () => `<h1 class=logo>Space4</h1>`;

  const AvatarImage = ({ image = "", styles = {} }) =>
    `<avatar-image ${inlineStyles(styles)}>${image}</avatar-image>`;

  const AvatarName = ({ name = "", edit = false, styles = {} }) => {
    return `<avatar-name ${inlineStyles(styles)}>${
      edit ? `<a href="#">${name}</a>` : name
    }</avatar-name>`;
  };

  // Para el cargador de tiempo:
  const Avatar = ({
    name,
    stylesImage = {},
    stylesName = {},
    avatar = {},
    edit = false,
  }) =>
    `<avatar class=cs>
      ${AvatarImage({
        image: avatar.image,
        styles: stylesImage,
      })}
      ${AvatarName({ name, styles: stylesName, edit })}
      ${
        edit
          ? ` <select class=avatars>${AVATARS.map(
              (v, i) =>
                `<option value=${i}${
                  avatar.index === i ? " selected" : ""
                }>${v}</option>`
            ).join("")}</select>`
          : ""
      }
    </avatar>`;

  const AvatarSearch = () => {
    return `<div class=avs ${inlineStyles({
      width: "80px",
      height: "80px",
      overflow: "hidden",
      position: "relative",
    })}>
        <div class=cs ${inlineStyles({
          "flex-direction": "column",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          animation: "vs 1.5s infinite linear",
          "font-size": "3.5rem",
        })}>
          ${AVATARS.map((v) => v).join("")}
        </div>
    </div>`;
  };

  /**
   * Componente que renderiza la pantalla de búsuqeda de un jugador
   */
  const SearchOpponent = () => {
    const currentPlayer = getPlayer();
    const stylesName = {
      "margin-top": "15px",
      "font-weight": "bold",
      "font-size": "15px",
    };

    setHtml(
      $("#render"),
      `<div class=cs ${inlineStyles({
        "flex-direction": "column",
        width: "100%",
        "z-index": 5,
      })}>
        ${ButtonBack()}
        ${Logo()}
        <div class="cs" ${inlineStyles({
          margin: "50px 0",
          width: "90%",
          "justify-content": "space-around",
        })}>
          ${Avatar({
            name: currentPlayer.name,
            avatar: {
              image: AVATARS[currentPlayer.avatar],
              index: currentPlayer.avatar,
            },
            stylesImage: {
              width: "70px",
              height: "70px",
              "font-size": "3.5rem",
            },
            stylesName,
          })}
          <h1>Vs</h1>
          <div id="vs" class=cs ${inlineStyles({
            "flex-direction": "column",
          })}>
            ${AvatarSearch()}
            ${AvatarName({
              name: "Searching...",
              styles: stylesName,
            })}
          </div>
        </div>
        <button class=button>Cancel</button>
      </div>`
    );

    const returnHome = () => {
      Screen();
      disconnectSocket();
    };

    $on($("#back"), "click", returnHome);
    $on($(".button"), "click", returnHome);

    // Configura la conexión del socket del juego...
    // TODO: Capturar el error cuando el socket que caiga
    configureSocket();
  };

  const PlayFriends = () => {
    setHtml(
      $("#render"),
      `<div class=cs ${inlineStyles({
        "flex-direction": "column",
        width: "100%",
        "z-index": 5,
      })}>
        ${ButtonBack()}
        ${Logo()}
      </div>`
    );

    $on($("#back"), "click", () => Screen());
  };

  /**
   * Renderiza la página de Looby
   */
  const Lobby = () => {
    const currentPlayer = getPlayer();

    setHtml(
      $("#render"),
      `<div class=cs ${inlineStyles({
        "flex-direction": "column",
        "z-index": 5,
      })}>
        ${Logo()}
        ${Avatar({
          name: currentPlayer.name,
          avatar: {
            image: AVATARS[currentPlayer.avatar],
            index: currentPlayer.avatar,
          },
          stylesName: {
            "margin-top": "15px",
            "font-weight": "bold",
            "font-size": "25px",
          },
          edit: true,
        })}
        <div class='cs options' ${inlineStyles({
          "flex-direction": "column",
          "margin-top": "25px",
        })}>
        ${[
          ["Vs Bot", "bot"],
          ["Two Players", "two"],
          ["Play Online", "online"],
          ["Play with friends", "friend"],
        ]
          .map(
            (v) =>
              `<button class=button id=${v[1]} ${inlineStyles({
                width: "260px",
                "margin-bottom": "20px",
              })}>${v[0]}</button>`
          )
          .join("")}
        </div>
        <a id="about" ${inlineStyles({
          color: "white",
          "z-index": 2,
          "font-size": "20px",
        })} href="#">About</a>
      </div>`
    );

    // Para el evento del about
    $on($("#about"), "click", (e) => {
      e.preventDefault();
      Modal.show({
        txt: `<p ${inlineStyles({
          "font-size": "3rem",
          "margin-bottom": "10px",
        })}>👨🏻‍💻</p><p>Game developed by Jorge Rubiano for the 2021 edition of ${generateLink(
          "#js13k",
          "https://js13kgames.com/"
        )}</p><div class=wh ${inlineStyles({ padding: "15px" })}><ul>${[
          ["Twitter", "https://twitter.com/ostjh"],
          ["Github", "https://github.com/Jorger"],
          ["Linkedin", "https://www.linkedin.com/in/jorge-rubiano-a8616319"],
        ]
          .map(
            (v) =>
              `<li ${inlineStyles({ "margin-bottom": "5px" })}>${generateLink(
                v[0],
                v[1]
              )} </li>`
          )
          .join("")}</ul></div>`,
        yes: "Ok",
        no: "",
      });
    });

    $$(".options > button").forEach((btn) => {
      $on(btn, "click", (e) => {
        const type = e.target.id;
        if (type === "two") {
          Screen("Game", {
            isTwoPlayers: true,
          });
        } else {
          Screen(
            {
              bot: "Difficulty",
              online: "SearchOpponent",
              friend: "PlayFriends",
            }[type]
          );
        }
      });
    });

    // Para los eventos dek avatar
    $on($(".avatars"), "change", (e) => {
      setHtml($("avatar-image"), AVATARS[e.target.value]);
      savePropierties("avatar", +e.target.value);
    });

    $on($("avatar-name a"), "click", (e) => {
      e.preventDefault();
      const newName = sanizateTags(
        prompt("Write your name (MAX 10)", getValueFromCache("name", ""))
      );

      if (newName) {
        const shortName =
          newName.length > 10 ? newName.substring(0, 10) + "..." : newName;

        $("avatar-name a").textContent = shortName;
        savePropierties("name", shortName);
      }
    });
  };

  /**
   * Indica la pantalla que se debe renderizar
   * @param {*} screen
   * @param {*} params
   */
  const Screen = (screen = "Lobby", params = {}) => {
    const Handler = {
      Lobby,
      Game,
      Difficulty,
      SearchOpponent,
      PlayFriends,
    };

    Handler[screen](params);

    // Ocultar el meteoro global en la pantalla del juego
    addStyle($("#m-global"), {
      top:
        screen === "Game"
          ? `${BASE_HEIGHT}px`
          : `${BASE_HEIGHT - BASE_WIDTH * 0.4}px`,
    });
  };

  const starsStyle = [600, 300, 200]
    .map(
      (v, index) =>
        `.star-${index} {width: 1px; height: 1px; background: transparent; box-shadow: ${new Array(
          v
        )
          .fill(null)
          .map(
            () => `${randomNumber(1, 2000)}px ${randomNumber(1, 2000)}px #FFF`
          )
          .join(",")}; animation : aS ${50 * index + 50}s linear infinite;
    }`
    )
    .join("");

  const style = document.createElement("style");
  setHtml(style, starsStyle);
  $("head").appendChild(style);

  // Renderizar la base del juego...
  setHtml(
    $("#root"),
    `${Modal.render()}<div id="render" class="wh cs"></div>${new Array(3)
      .fill(null)
      .map((_, i) => `<div class='star-${i}'></div>`)
      .join("")}${Meteor({
      id: "m-global",
      style: {
        width: `${BASE_WIDTH}px`,
        height: `${BASE_WIDTH}px`,
        top: `${BASE_HEIGHT - BASE_WIDTH * 0.4}px`,
        "z-index": 1,
        animation: "cr 60s infinite linear",
      },
    })}`
  );

  Modal.events();

  // Código para manejo de los sockets
  const disconnectSocket = () => {
    if (connectedSocket && socket) {
      connectedSocket = false;
      socket.disconnect();
    }
  };

  const configureSocket = (options = {}) => {
    socket = io();
    connectedSocket = true;

    // Envia la data del usuario actual al server y busca un jugador
    socket.on("connect", () => {
      socket.emit("newUser", { ...options, player: getPlayer() }, (error) => {
        console.log("Data");
      });
    });

    socket.on("startGame", (data) => {
      const currentPlayer = data.p1.token === getPlayer().token ? "p1" : "p2";

      Screen("Game", {
        isOnline: {
          room: data.room,
          playerStartsGame: data.playerStartsGame,
          color: data[currentPlayer].color,
          p2: data[currentPlayer === "p1" ? "p2" : "p1"],
        },
      });
    });
  };
  // fin código de los sockets

  // Establecer alugno valores en sesion storage
  if (!ObjectKeys(getDataCache()).length) {
    savePropierties("name", `Astronaut ${randomNumber(100, 999)}`);
    savePropierties("avatar", randomNumber(0, AVATARS.length - 1));
    savePropierties("token", guid());
  }

  Screen();
  $on(document, "contextmenu", (event) => event.preventDefault());
  $on(window, "resize", onWindowResize);
  onWindowResize();
})();
