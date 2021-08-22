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
  const METEOR_COLORS = ['blue', 'red'];
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
  }, 50);


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
    style = {},
    id = "",
    an = false,
  }) =>
    `<meteor ${id ? `id=${id} ` : ""}${an ? `class=an ` : ''}${inlineStyles(style)}></meteor>`;


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
    const {isTwoPlayers = false, isBot = "", isOnline = {} } = options;
    console.log("OPTIONS");
    console.log(options);
    console.log({isTwoPlayers, isBot, isOnline});
    // {isOnline : {activated : false}, isBot : {activated : false}, isTwoPlayers : {activated : false}}
    // La grila dle juego...
    let GRID = createGrid(() => []);
    let meteorCounter = 0;
    // Determina si una animación se está ejecuatando...
    let animationOn = false;
    // Para el color
    let meteorColor = 1; // mejorar esta parte

    // Guardará las conexiones que están cerca a cumplirse
    // útil para la IA
    let possibleConnections = {};
    /*
    1 es azul
    2 es rojo
    */


    /**
     * Función que valida el siguiente movimiento
     * En está función, también se determina si se ha hecho la conexión
     * @param {*} response 
     */
    const validateEndsMovement = (response) => {
      // console.log("responde esto");
      console.log(response);

      // Guarda los posibles movimientos
      // útil para la validación de tipo IA
      if (ObjectKeys(response.posible).length) {
        const color = METEOR_COLORS[meteorColor - 1];

        if (!possibleConnections[color]) {
          possibleConnections[color] = {};
        }

        // Iterar sobre todos los posibles...
        for (let counter = MAX_METEORITES - 1; counter >= 1; counter--) {
          const possibleKey = `c-${MAX_METEORITES - counter}`;

          if (!possibleConnections[color][possibleKey]) {
            possibleConnections[color][possibleKey] = [];
          }

          if (response.posible[possibleKey].length) {
            possibleConnections[color][possibleKey] = [...new Set([...possibleConnections[color][possibleKey], ...response.posible[possibleKey]].map(v => `${v[0]}${v[1]}`))].map(v => v.split('').map(n => +n));
          }
        }

        console.log(possibleConnections);
      }

      animationOn = false;
      meteorCounter++;
      meteorColor = meteorColor === 1 ? 2 : 1;

      // Filtrar sólo aquellos que tengan base...
      // posible = posible.filter(v => v[0] + 1 === NUM_ROWS ? true : GRID[v[0] + 1][v[1]].length !== 0);
    }

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

          if (possibleLines.v.length === MAX_METEORITES) {
            break;
          }
        }
        else {
          break;
        }
      }

      // Existe la cantidad de meteoritos en vertical
      if (possibleLines.v.length === MAX_METEORITES) {
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

            if (possibleLines.h.length === MAX_METEORITES) {
              break;
            }

          } else {
            break;
          }
        } while (1);
      }

      // Existe la cantidad de meteoritos en horizontal
      if (possibleLines.h.length === MAX_METEORITES) {
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

              if (possibleLines[key].length === MAX_METEORITES) {
                break;
              }

            } else {
              break;
            }
          } while (1);
        }

        if (possibleLines[key].length === MAX_METEORITES) {
          return {
            connect: true,
            posible,
            meteorites: possibleLines[key]
          }
        }
      }

      // Si llega a este punto, es que no existe ninguna coincidencia
      // Por lo tanto se devolverá las cercanas...

      // TO-DO: Validar que sólo se haga esto si se está jugando Vs un bot
      // Además que el nivel del juego sea medium or hard
      for (let counter = MAX_METEORITES - 1; counter >= 1; counter--) {
        const possibleKey = `c-${MAX_METEORITES - counter}`;
        posible[possibleKey] = [];

        // Para horizontal
        if (possibleLines.h.length === MAX_METEORITES - counter) {
          // debugger;
          const posibleHorizontal = possibleLines.h.map(v => v[1]).sort();
          const limits = {
            left: posibleHorizontal[0] - 1,
            right: posibleHorizontal[posibleHorizontal.length - 1] + 1
          };

          for (let times = 1; times <= 2; times++) {
            const key = times === 1 ? "left" : "right";

            if (coordinateOnStage(row, limits[key]) && GRID[row][limits[key]].length === 0) {
              posible[possibleKey].push([row, limits[key]]);
            }
          }
        }

        // // Vertical
        if (possibleLines.v.length === MAX_METEORITES - counter) {
          // debugger;
          const topLimit = possibleLines.v[0][0] - 1;

          if (coordinateOnStage(topLimit, col) && GRID[topLimit][col].length === 0) {
            posible[possibleKey].push([topLimit, col]);
          }
        }

        // Para las diagonales...
        for (let diagonal = 1; diagonal <= 2; diagonal++) {
          const key = diagonal === 1 ? 'id' : 'di';

          if (possibleLines[key].length === MAX_METEORITES - counter) {
            // debugger;
            const posibleDiagonal = possibleLines[key].sort((a, b) => a[0] - b[0]);

            for (let times = 1; times <= 2; times++) {
              const limits = posibleDiagonal[times === 1 ? 0 : posibleDiagonal.length - 1];

              const newRow = limits[0] + (times === 1 ? -1 : 1);
              const newCol = limits[1] + (diagonal === 1 ? times === 1 ? -1 : 1 : times === 1 ? 1 : -1);

              if (coordinateOnStage(newRow, newCol) && GRID[newRow][newCol].length === 0) {
                posible[possibleKey].push([newRow, newCol]);
              }
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
        filter: `brightness(40%) sepia(100%) hue-rotate(${color === 1 ? 183 : -50}deg) saturate(600%)`,
        visibility: 'visible'
      });

      // Establece el color del meteoró...
      // addClass(newMeteor, ['b', 'r'][color - 1]);

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
      onRest(mt, (e) =>
        validateEndsMovement(validateMeteorConnection(e.target.getAttribute('p').split('-')))
      )
    );
  };


  const Difficulty = () => {
    setHtml(
      $("#render"),
      `<div class='cs' ${inlineStyles({ 'flex-direction': 'column' })}>
        <button id=back  ${inlineStyles({
        position: 'absolute',
        left: '5%',
        top: '5%',
        'font-size': '20px',
        background: 'no-repeat',
        color: 'white',
        border: 0,
        cursor: 'pointer', 
        'font-weight' : 'bold'
      })}>Back</button>
        <h2 ${inlineStyles({ 'margin-bottom': '20px', 'text-align' : 'center', 'text-transform' : 'uppercase' })}>${getValueFromCache("name", "")}<br>CHOOSE DIFFICULTY</h2>
        ${["Easy", "Medium", "Hard"].map(v => `<button class=button id=${v.toLowerCase()} ${inlineStyles({ width: '150px', 'margin-bottom': '20px' })}>${v}</button>`).join("")}
      </div>`
    );

    $$('.button').forEach(btn => {
      $on(btn, "click", (e) => {
        App("Game", {
          isBot : e.target.id
        });
      });
    });

    $on($("#back"), "click", () => App("Lobby"));
  };


  const Logo = () => `<h1 class=logo>Space4</h1>`;

  // Para el cargador de tiempo:
  // https://codeconvey.com/css-percentage-circle/
  const Avatar = ({ name, avatar, edit = true }) => {
    return `<avatar class=cs>
              <avatar-image>
                ${AVATARS[avatar]}
              </avatar-image>
              <avatar-name>
                ${edit ? `<button>${name}</button>` : name}
              </avatar-name>
              ${edit ? `
                <select class=avatars>
                  ${AVATARS.map((v, i) => `<option value=${i}${avatar === i ? " selected" : ""}>${v}</option>`).join('')}
                </select>` : ""
              }
            </avatar>`;
  }

  const Lobby = () => {
    // Cuando tenga que jugar contra el roboto se usa este emoji: 🤖
    // Cuando juegue contra otra persona en el mismo equipo: 👽

    setHtml(
      $("#render"),
      `<div class=cs ${inlineStyles({ 'flex-direction': 'column', 'z-index': 5 })}>
        ${Logo()}
        ${Avatar({
        name: getValueFromCache("name", ""),
        avatar: getValueFromCache("avatar", 0)
      })}
        <div class='cs options' ${inlineStyles({ 'flex-direction': 'column', 'margin-top': '25px' })}>
          ${[
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
          ].map(v => `<button class=button id=${v[1]} ${inlineStyles({ width: '260px', 'margin-bottom': '20px' })}>${v[0]}</button>`).join("")}
        </div>
      </div>`
    );

    $$('.options > button').forEach(btn => {
      $on(btn, "click", (e) => {
        const type = e.target.id;
        const options = {};

        if(type === "two") {
          options.isTwoPlayers = true;
          App("Game", options);
        }

        if(type === "bot") {
          App("Difficulty");
        }
        
      });
    });

    // Para los eventos dek avatar
    $on($(".avatars"), "change", (e) => {
      setHtml($("avatar-image"), AVATARS[e.target.value]);
      savePropierties("avatar", +e.target.value);
    });

    $on($("avatar-name button"), "click", () => {
      const newName = sanizateTags(
        prompt('Write your name (MAX 10)', getValueFromCache("name", ""))
      );

      if (newName) {
        const shortName = newName.length > 10 ? newName.substring(0, 10) + '...' : newName;

        $("avatar-name button").textContent = shortName;
        savePropierties("name", shortName);
      }
    });
  };

  const App = (screen = "Lobby", params = {}) => {
    const Handler = {
      Lobby,
      Game,
      Difficulty
    };

    Handler[screen](params);
  };

  const starsStyle = [300, 200, 100].map((v, index) =>
    `.star-${index} {
      width: 1px;
      height: 1px;
      background: transparent;
      box-shadow: ${new Array(v).fill(null).map(() => `${randomNumber(1, 2000)}px ${randomNumber(1, 2000)}px #FFF`).join(',')};
      animation : animStar ${(50 * index) + 50}s linear infinite;
    }`
  ).join('');

  const style = document.createElement("style");
  setHtml(style, starsStyle);
  $("head").appendChild(style);

  // Renderizar la base del juego...
  setHtml(
    $("#root"),
    `<div id="render" class="wh cs"></div>${Meteor({
      c: 'g',
      style: {
        width: `${BASE_WIDTH}px`,
        height: `${BASE_WIDTH}px`,
        top: `${BASE_HEIGHT - BASE_WIDTH * 0.4}px`,
        'z-index': 2
      },
      an: true,
    })}
    ${new Array(3).fill(null).map((_, i) => `<div class='star-${i}'></div>`).join('')}
    `
  );

  // Establecer alugno valores en sesion storage
  if (!ObjectKeys(getDataCache()).length) {
    savePropierties("name", `Astronaut ${randomNumber(100, 999)}`);
    savePropierties("avatar", randomNumber(0, AVATARS.length - 1));
    savePropierties("token", guid());
  }

  App("Lobby");
  // App("Difficulty");
  // App("Game");

  $on(document, "contextmenu", (event) => event.preventDefault());
  $on(window, "resize", onWindowResize);
  onWindowResize();
})();
