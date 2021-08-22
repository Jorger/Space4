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
  const AVATARS = ["👩‍🚀", "👩🏽‍🚀", "👨‍🚀", "👩🏻‍🚀", "👨🏼‍🚀", "👩🏼‍🚀", "👩🏾‍🚀", "👨🏽‍🚀", "👨🏻‍🚀", "👨🏿‍🚀", "👩🏿‍🚀", "👨🏾‍🚀"];
  const CACHE_KEY = "space-four";
  $("html").style.cssText += `--h: ${BASE_HEIGHT}px; --w: ${BASE_WIDTH}px`;
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
  const savePropierties = (
    property,
    value,
    storageType = "localStorage"
  ) => {
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

  // const removeClass = (target, className) => {
  //   if (target) {
  //     className.split(' ').forEach((classText) => {
  //       target.classList.remove(classText);
  //     });
  //   }
  // };

  /**
   * Eliminar un evento
   * @param {*} target
   * @param {*} type
   * @param {*} callback
   * @param {*} parameter
   */
  // const $off = (target, type, callback, parameter = {}) => {
  //   if (target) {
  //     target.removeEventListener(type, callback, parameter);
  //   }
  // };

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
    ObjectKeys(styles).length ? `style='${ObjectKeys(styles).map((v) => `${v}:${styles[v]}`).join(";")}'` : '';


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
  }, 100);


  /**
   * Función que crea un array para la grilla
   * @param {*} callback 
   * @returns 
   */
  const createGrid = callback => new Array(NUM_ROWS).fill(null).map((_, c) => new Array(NUM_COLS).fill(null).map((_, f) => callback(c, f)))
  // fin de utilidades

  /**
   * Componente que renderizará un meteoro...
   * @param {*} param0 
   * @returns 
   */
  const Meteor = ({
    c = "",
    style = {},
    id = "",
    an = false,
  }) =>
    `<meteor ${id ? `id=${id} ` : ""}${c ? `class='${c}${an ? ' an' : ''}' ` : ''}${inlineStyles(style)}></meteor>`;


  // Filas vertical
  // columnas horizontal

  /**
   * Renderiza el board base del juego
   * También renderizará los meteoros
   * @returns
   */
  const BoardHoles = () =>
    `<holes class=wh ${inlineStyles({
      "-webkit-mask-image": `radial-gradient(transparent 50%, #fff 50%)`,
      "-webkit-mask-size": `${METEOR_SIZE}px ${METEOR_SIZE}px`,
      "-webkit-mask-position": `${METEOR_SIZE}px ${METEOR_SIZE}px`,
    })}>
      ${new Array(NUM_COLS).fill(null).map((_, i) => `<button id='h-${i}' ${inlineStyles({ width: `${METEOR_SIZE}px` })}></button>`).join('')}
    </holes>`;

  const Board = () =>
    `<board ${inlineStyles({ width: `${METEOR_SIZE * 7}px`, height: `${METEOR_SIZE * 6}px` })}>
      ${BoardHoles()}
      ${createGrid((c, f) => Meteor({
      id: `m-${(f) + (c * 7)}`, style: {
        width: `${METEOR_SIZE * 0.63}px`,
        height: `${METEOR_SIZE * 0.63}px`,
        visibility: 'hidden'
      }
    })).map(v => v.join('')).join('')}
    </board>`

  // 16% de METEOR_SIZE

  const Game = (options) => {
    console.log(options);
    // La grila dle juego...
    let GRID = createGrid(() => []);
    let meteorCounter = 0;
    // Determina si una animación se está ejecuatando...
    let animationOn = false;
    // Para el color
    let meteorColor = 1; // mejorar esta parte

    // Guardará las conexiones que están cerca a cumplirse
    // útil para la IA
    let possibleConnections = [];
    /*
    1 es azul
    2 es rojo
    */

    /**
     * Valida si una coordenada está dentro del escenario 
     * @param {*} row 
     * @param {*} col 
     * @returns 
     */
    const coordinateOnStage = (row, col) => row >= 0 && row < NUM_ROWS && col >= 0 && col < NUM_COLS;

    /**
     * Función que valida si se ha logrado conectar los meteoros
     * También devuelve potenciales movimientos para evitar la conexión, útil para la "IA"
     * @param {*} position 
     * @param {*} connection 
     * @returns 
     */
    const validateMeteorConnection = (position, connection = MAX_METEORITES) => {
      const row = +position[0];
      const col = +position[1];
      const currentColor = GRID[row][col][0];
      const possibleLines = { v: [[row, col]] };
      // Guarda las posiciones posibles de conexión...
      const posible = [];

      // Dada la posición, se busca si existe 4 o tres elementos del mismo color (horizontal, diagonal y vertical)
      // Si hay 4 elementos se indica que ha ganado y se devuleve un array con las posiciones de los elementos
      // Si es 3 igualmente se devuleve, para así ayudar a inferior al IA

      // Primero en vertical...
      for (let i = row + 1; i < NUM_ROWS; i++) {
        if (GRID[i][col][0] === currentColor) {
          possibleLines.v.push([i, col]);

          if (possibleLines.v.length === connection) {
            break;
          }
        }
        else {
          break;
        }
      }

      // Existe la cantidad de meteoritos en vertical
      if (possibleLines.v.length === connection) {
        return {
          connect: true,
          posible, 
          meteorites: possibleLines.v
        }
      }

      // Ahora buscar en horizontal...
      possibleLines.h = [[row, col]];
      for (let times = 1; times <= 2; times++) {
        let newCol = col + (times === 1 ? -1 : 1);
        do {
          if (coordinateOnStage(row, newCol) && GRID[row][newCol][0] === currentColor) {
            possibleLines.h.push([row, newCol]);
            newCol += times === 1 ? -1 : 1;

            if (possibleLines.h.length === connection) {
              break;
            }

          } else {
            break;
          }
        } while (1);
      }

      // Existe la cantidad de meteoritos en horizontal
      if (possibleLines.h.length === connection) {
        return {
          connect: true,
          posible, 
          meteorites: possibleLines.h
        }
      }

      // Para validar las diagonales
      for (let diagonal = 1; diagonal <= 2; diagonal++) {
        const key = diagonal === 1 ? 'id' : 'di';
        possibleLines[key] = [[row, col]];

        for (let times = 1; times <= 2; times++) {
          const increments = {
            col: diagonal === 1 ? times === 1 ? -1 : 1 : times === 1 ? 1 : -1,
            row: times === 1 ? -1 : 1
          };

          let newCol = col + increments.col;
          let newRow = row + increments.row;

          do {
            if (coordinateOnStage(newRow, newCol) && GRID[newRow][newCol][0] === currentColor) {
              possibleLines[key].push([newRow, newCol]);
              newRow += increments.row;
              newCol += increments.col;

              if (possibleLines[key].length === connection) {
                break;
              }

            } else {
              break;
            }
          } while (1);
        }

        if (possibleLines[key].length === connection) {
          return {
            connect: true,
            posible, 
            meteorites: possibleLines[key]
          }
        }
      }

      // Si llega a este punto, es que no existe ninguna coincidencia
      // Por lo tanto se devolverá las cercanas...
      // Para horizontal
      if (possibleLines.h.length === connection - 1) {
        // debugger;
        const posibleHorizontal = possibleLines.h.map(v => v[1]).sort();
        const limits = {
          left: posibleHorizontal[0] - 1,
          right: posibleHorizontal[posibleHorizontal.length - 1] + 1
        };

        for (let times = 1; times <= 2; times++) {
          const key = times === 1 ? "left" : "right";

          if (coordinateOnStage(row, limits[key]) && GRID[row][limits[key]].length === 0) {
            posible.push([row, limits[key]]);
          }
        }
      }

      // // Vertical
      if (possibleLines.v.length === connection - 1) {
        // debugger;
        const topLimit = possibleLines.v[0][0] - 1;

        if (coordinateOnStage(topLimit, col) && GRID[topLimit][col].length === 0) {
          posible.push([topLimit, col]);
        }
      }

      // Para las diagonales...
      for (let diagonal = 1; diagonal <= 2; diagonal++) {
        const key = diagonal === 1 ? 'id' : 'di';

        if (possibleLines[key].length === connection - 1) {
          // debugger;
          const posibleDiagonal = possibleLines[key].sort((a, b) => a[0] - b[0]);

          for (let times = 1; times <= 2; times++) {
            const limits = posibleDiagonal[times === 1 ? 0 : posibleDiagonal.length - 1];

            const newRow = limits[0] + (times === 1 ? -1 : 1);
            const newCol = limits[1] + (diagonal === 1 ? times === 1 ? -1 : 1 : times === 1 ? 1 : -1);

            if (coordinateOnStage(newRow, newCol) && GRID[newRow][newCol].length === 0) {
              posible.push([newRow, newCol]);
            }
          }
        }
      }

      return {
        connect: false,
        posible
      }
    }


    /**
     * Función que captura la columna seleccionada en el board
     * @param {*} index 
     */
    const selectedColumn = (index = 0, color = 1) => {
      // Primero determinar la posición a donde llegaría el meteoro, 
      // dependiendo de los valores qu existan en la grilla...
      const newPosition = GRID.map(v => v[index]).filter(v => !v.length).length - 1;
      if (animationOn || newPosition < 0) return;

      const newMeteor = $(`#m-${meteorCounter}`);
      // Guarda el color en la grilla
      GRID[newPosition][index] = [color, meteorCounter];
      // Guardar atributos en el elemento
      newMeteor.setAttribute('p', `${newPosition}-${index}`);

      // Establecer la posición inicial...
      addStyle(newMeteor, {
        left: `${BASE_POSITION + (METEOR_SIZE * index)}px`,
        top: `${(METEOR_SIZE + BASE_POSITION) * -1}px`,
        visibility: 'visible'
      });

      // Establece el color del meteoró...
      addClass(newMeteor, ['b', 'r'][color - 1]);

      // Interrupción para indicar la posición de llegada
      setTimeout(() => {
        addStyle(newMeteor, {
          top: `${(BASE_POSITION) + (METEOR_SIZE * newPosition)}px`,
        });
      }, 100)

      // Establece que se está haciendo una animación de movimiento
      animationOn = true;
    }



    /**
     * Función que resetea el estado del juego...
     */
    // const resetGame = () => {
    // Solo cambiar el visibility
    //   // Resetea las posiciones de los meteoros en el board
    //   $$('board > meteor').forEach(mt => addStyle(mt, {visibility : 'hidden', left : 0, top : 0}));
    //   // Resetear los valores de la matriz d ela grilla
    // document.querySelector("#m-0").style = '';
    // document.querySelector("#m-0").className = ''
    //   GRID = createGrid(() => 0)
    // };

    // Renderiza el html del juego
    setHtml(
      $("#render"),
      `<div class='wh cs'>
        ${Board()}
      </div>`
    );

    // Crear los eventos para el click en los hoyos
    $$('holes > button').forEach(btn =>
      $on(btn, "click", (e) => selectedColumn(+e.target.id.split('-')[1], meteorColor))
    );

    // Para los eventos de los mateoros...
    $$('board > meteor').forEach(mt =>
      onRest(mt, (e) => {
        const response = validateMeteorConnection(e.target.getAttribute('p').split('-'));
        // console.log("responde esto");
        console.log(response);

        if (response.posible.length) {
          if (!possibleConnections[meteorColor - 1]) {
            possibleConnections[meteorColor - 1] = [];
          }

          possibleConnections[meteorColor - 1] = [...possibleConnections[meteorColor - 1], ...response.posible];
          console.log(possibleConnections);
        }

        animationOn = false;
        meteorCounter++;
        meteorColor = meteorColor === 1 ? 2 : 1;

        // Filtrar sólo aquellos que tengan base...
        // posible = posible.filter(v => v[0] + 1 === NUM_ROWS ? true : GRID[v[0] + 1][v[1]].length !== 0);
      })
    );

    // Agregar los eventos
    // $on($("#lobby"), "click", () => {
    //   console.log("Var al Lobby");
    //   App("Lobby");
    // });
  };


  const Difficulty = () => {
    const BTS = ["Easy", "Medium", "Hard"];

    setHtml(
      $("#render"),
      `<div class='wh cs'>
        ${BTS.map(v => `<button id=${v.toLowerCase()}>${v}</button>`).join("")}
      </div>`
    );

    $$('button').forEach(btn => {
      $on(btn, "click", (e) => {
        console.log(e.target.id);
      });
    });
  };


  const Avatar = ({name, avatar}) => {
    console.log({name, avatar});
    return `<div class='cs' style="flex-direction: column;"><avatar>${AVATARS[avatar]}</avatar>${name}</div>`;
  }

  const Lobby = () => {
    const avatarData = {
      name : getValueFromCache("name", ""), 
      avatar : getValueFromCache("avatar", 0)
    };

    const BTS = [
      [
        'Vs Bot',
        'bot'
      ],
      [
        'Two Players',
        'two'
      ],
      [
        'Play with friends',
        'friend'
      ],
      [
        'Play Online',
        'online'
      ]
    ];

    // Cuando tenga que jugar contra el roboto se usa este emoji: 🤖
    // Cuando juegue contra otra persona en el mismo equipo: 👽


    setHtml(
      $("#render"),
      `<div>
        ${Avatar(avatarData)}
        <div class=options>
          ${BTS.map(v => `<button id=${v[1]}>${v[0]}</button>`).join("")}
        </div>
      </div>`
    );

    $$('.options > button').forEach(btn => {
      $on(btn, "click", (e) => {
        const type = e.target.id;
        if (type !== "bot") {
          App("Game", { type: "nothibg" });
        } else {
          App("Difficulty");
        }
      });
    });


    // Agregar los eventos
    // $on($("button"), "click", () => {
    //   console.log("Va al Game");
    //   App("Game");
    // });
  };

  const App = (screen = "Lobby", params = {}) => {
    const Handler = {
      Lobby,
      Game,
      Difficulty
    };

    Handler[screen](params);
  };

  const meteorColors = {
    g: {
      b: "#bbacb0",
      p: "#675c60",
      s: "#81767a",
      t: "#938c8f",
    },
    b: {
      b: "#3d72b1",
      p: "#03478d",
      s: "#0166ac",
      t: "#085b9c",
    },
    r: {
      b: "#ea694f",
      p: "#e0552c",
      s: "#b82a0d",
      t: "#d44729",
    },
  };

  const customStyle = ObjectKeys(meteorColors)
    .map(
      (m) => `
      meteor.${m} {
        background: ${meteorColors[m].b};
        background-image: ${new Array(9)
          .fill(null)
          .map(
            (_, i) =>
              `radial-gradient(circle, ${meteorColors[m][i <= 6 ? "p" : i === 7 ? "s" : "t"]
              } ${i <= 6 ? 18 : 60}%, rgba(255, 255, 255, 0) ${(i <= 6 ? 18 : 60) + 1
              }%)`
          )
          .join(",")};
        background-repeat: no-repeat;
        background-size: 89% 85%, 60% 60%, 30% 30%, 15% 15%, 15% 15%, 15% 15%, 23% 23%, 120% 120%, 120% 120%;
        background-position: -109% -82%, 115% -5%, 70% 42%, 59% 7%, 39% 52%, 55% 87%, 30% 77%, -60% 53%, 0 53%;
      }
    `
    )
    .join("");

  const style = document.createElement("style");
  setHtml(style, customStyle);
  $("head").appendChild(style);

  // Renderizar la base del juego...
  setHtml(
    $("#root"),
    `<div id="render" class="wh cs"></div>${Meteor({
      c: 'g',
      style: {
        width: `${BASE_WIDTH}px`,
        height: `${BASE_WIDTH}px`,
        top: `${BASE_HEIGHT - BASE_WIDTH * 0.4}px`
      },
      an: true,
    })}`
  );

  // Establecer alugno valores en sesion storage
  if(!ObjectKeys(getDataCache()).length) {
    savePropierties("name", `Astronaut ${randomNumber(100, 999)}`);
    savePropierties("avatar", randomNumber(0, AVATARS.length - 1));
  }

  App("Lobby");

  $on(document, "contextmenu", (event) => event.preventDefault());
  $on(window, "resize", onWindowResize);
  onWindowResize();
})();
