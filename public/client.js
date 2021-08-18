"use strict";

(() => {
  // Utilidades
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const BASE_HEIGHT = 732;
  const BASE_WIDTH = 412;
  $("html").style.cssText += `--h: ${BASE_HEIGHT}px; --w: ${BASE_WIDTH}px`;
  const setHtml = (element, html) => (element.innerHTML = html);

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
    $on(target, "transitionend", (evt) => callback(evt.propertyName));

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
  // fin de utilidades

  /**
   * Componente que renderizará un meteoro...
   * @param {*} size
   * @param {*} color
   * @param {*} left
   * @param {*} top
   * @param {*} animated
   * @returns
   */
  const Meteor = (
    size = 20,
    color = "g",
    left = 0,
    top = 0,
    animated = false
  ) =>
    `<meteor class='${color} ${
      animated ? "an" : ""
    }' style='width:${size}px;height:${size}px;left:${left}px;top:${top}px'></meteor>`;

  const Game = () => {
    setHtml(
      $("#render"),
      `<div>Y este es el juego<br><button>Lobby</button></div>`
    );

    // Agregar los eventos
    $on($("button"), "click", () => {
      console.log("Var al Lobby");
      App("Lobby");
    });
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

  const customStyle = Object.keys(meteorColors)
    .map(
      (m) => `
      meteor.${m} {
        background: ${meteorColors[m].b};
        background-image: ${new Array(9)
          .fill(null)
          .map(
            (_, i) =>
              `radial-gradient(circle, ${
                meteorColors[m][i <= 6 ? "p" : i === 7 ? "s" : "t"]
              } ${i <= 6 ? 18 : 60}%, rgba(255, 255, 255, 0) ${
                (i <= 6 ? 18 : 60) + 1
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

  setHtml(
    $("#root"),
    `<div id="render" class="wh cs"></div>${Meteor(
      BASE_WIDTH,
      "g",
      0,
      BASE_HEIGHT - BASE_WIDTH * 0.4,
      true
    )}`
  );

  App("Lobby");

  $on(document, "contextmenu", (event) => event.preventDefault());
  $on(window, "resize", onWindowResize);
  onWindowResize();
})();
