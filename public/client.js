"use strict";

(() => {
  // Utilidades
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const BASE_HEIGHT = 732;
  const BASE_WIDTH = 412;
  const METEOR_SIZE = 50;
  const BASE_POSITION = METEOR_SIZE * 0.18;
  $("html").style.cssText += `--h: ${BASE_HEIGHT}px; --w: ${BASE_WIDTH}px`;
  const setHtml = (element, html) => (element.innerHTML = html);
  const ObjectKeys = (obj) => Object.keys(obj);

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
  const createGrid = callback => new Array(6).fill(null).map((_, c) => new Array(7).fill(null).map((_, f) => callback(c, f)))
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


  // Filas horizontal
  // columnas vertical

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
      ${new Array(7).fill(null).map((_, i) => `<button id='h-${i}' ${inlineStyles({ width: `${METEOR_SIZE}px` })}></button>`).join('')}
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

  const Game = () => {
    // La grila dle juego...
    let GRID = createGrid(() => []);

    let meteorCounter = 0;
    // Determina si una animación se está ejecuatando...
    let animationOn = false;
    // Para el color
    let meteorColor = 1; // mejorar esta parte
    /*
    1 es azul
    2 es rojo
    */


    const validateConnectFour = ([f, c] = position) => {
      // Dada la posición, se busca si existe 4 o tres elementos del mismo color (horizontal, diagonal y vertical)
      // Si hay 4 elementos se indica que ha ganado y se devuleve un array con las posiciones de los elementos
      // Si es 3 igualmente se devuleve, para así ayudar a inferior al IA
      animationOn = false;
      meteorCounter++;
      meteorColor = meteorColor === 1 ? 2 : 1;
      // const [f, c] = e.target.getAttribute('p').split('-');
      // console.log(e.target.getAttribute('p'));
      console.log(GRID);
      console.log(GRID[f][c]);
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
        validateConnectFour(e.target.getAttribute('p').split('-'));
      })
    );

    // Agregar los eventos
    // $on($("#lobby"), "click", () => {
    //   console.log("Var al Lobby");
    //   App("Lobby");
    // });
  };

  const Lobby = () => {
    setHtml(
      $("#render"),
      `<div>Renderizará el lobby<br><button>Game</button></div>`
    );

    // Agregar los eventos
    $on($("button"), "click", () => {
      console.log("Va al Game");
      App("Game");
    });
  };

  const App = (screen = "Lobby") => {
    const Handler = {
      Lobby,
      Game,
    };

    Handler[screen]();
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

  App("Game");

  $on(document, "contextmenu", (event) => event.preventDefault());
  $on(window, "resize", onWindowResize);
  onWindowResize();
})();
