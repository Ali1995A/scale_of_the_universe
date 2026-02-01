import * as PIXI from 'pixi.js-legacy'
import 'pixi.js-legacy';


import { Slider } from "./classes/slider";
import { Universe } from "./classes/universe";
import { ScaleText } from "./classes/scaleText";
import { CreditText } from "./classes/creditText";

import { pad } from "./helpers/pad";
import { E } from "./helpers/e";
import { map } from "./helpers/map";
import { toPinyinDisplayFromHanzi } from "./helpers/trilingual";

import { Tweenable } from "shifty";

import { Howl, Howler } from "howler";
import { create } from "domain";

import isMobile from 'ismobilejs';
declare var ldBar: any;
let hasPickedLang = false;
let allHighTextures;

const ua = window.navigator.userAgent || "";
const isWeChat = /MicroMessenger/i.test(ua);
const isIOS =
  /iPad|iPhone|iPod/i.test(ua) ||
  // iPadOS 13+ reports as Mac but with touch points
  (window.navigator.platform === "MacIntel" && (window.navigator as any).maxTouchPoints > 1);
const isIPad =
  /iPad/i.test(ua) ||
  (window.navigator.platform === "MacIntel" &&
    (window.navigator as any).maxTouchPoints > 1 &&
    Math.max(screen.width, screen.height) >= 1024);

document.documentElement.classList.toggle("is-ios", isIOS);
document.documentElement.classList.toggle("is-ipad", isIPad);
document.documentElement.classList.toggle("is-wechat", isWeChat);

function updateOrientationClass() {
  const landscape = window.matchMedia?.("(orientation: landscape)")?.matches ?? window.innerWidth > window.innerHeight;
  document.documentElement.classList.toggle("is-landscape", landscape);
  document.documentElement.classList.toggle("is-portrait", !landscape);
}

function updateVhVar() {
  const vv: any = (window as any).visualViewport;
  const height = (vv?.height ?? window.innerHeight);
  const vh = height * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

function throttle<T extends (...args: any[]) => void>(fn: T, waitMs: number): T {
  let last = 0;
  let timer: any = null;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = waitMs - (now - last);
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      fn.apply(this, args);
      return;
    }
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        last = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  } as any as T;
}

updateOrientationClass();
updateVhVar();

const onViewportChanged = throttle(() => {
  updateOrientationClass();
  updateVhVar();
}, 150);

window.addEventListener("resize", onViewportChanged, { passive: true } as any);
window.addEventListener("orientationchange", () => setTimeout(onViewportChanged, 250), { passive: true } as any);
(window as any).visualViewport?.addEventListener?.("resize", onViewportChanged, { passive: true } as any);

const titles = [
  'The Scale of the Universe 2',
  'סדרי גודל ביקום',
  'De schaal van het Universum',
  'The Scale of the Universe 2',
  '宇宙的刻度',
  'La Escala del Universo 2',
  'Universums Skala',
  'Rozmiar Wszechświata',
  'A Escala do Universo',
  'Die Proportionen des Universums',
  '宇宙的刻度',
  "L'échelle de l'Univers",
  'La Skalo de la Universo',
  'Scala Universului',
  'Розмір Всесвіту',
  'ﻥﻮﻜﻟﺍ ﺱﺎﻴﻘﻣ',
  '우주의 규모',
  'Universumi ulatus',
  'ابعاد جهان 2',
  'Evren Ölçeði 2'
]

const titleEl = document.getElementById("title");
const hoverTitleEl = document.getElementById("hoverTitle");
let hoverTimeout;

function clearElement(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function setTrilingualElement(el: Element, hanzi: string, english: string) {
  clearElement(el);

  const wrap = document.createElement("span");
  wrap.className = "trilingual";

  const pinyin = document.createElement("span");
  pinyin.className = "pinyin-text";
  pinyin.textContent = toPinyinDisplayFromHanzi(hanzi);

  const zh = document.createElement("span");
  zh.className = "hanzi-text";
  zh.textContent = hanzi;

  const en = document.createElement("span");
  en.className = "english-text";
  en.textContent = english;

  wrap.appendChild(pinyin);
  wrap.appendChild(zh);
  wrap.appendChild(en);

  el.appendChild(wrap);
}

async function ensureFontsLoaded() {
  const fontSet: any = (document as any).fonts;
  if (!fontSet?.load) return;

  try {
    await fontSet.load('16px "SOTU Pinyin"');
    if (fontSet.ready) await fontSet.ready;
  } catch (e) {
    // ignore font loading failures; the app still runs with fallbacks
  }
}
// window['setTitle'] = (idx) => {
//   if (hoverTimeout) 
//     clearTimeout(hoverTimeout);

//   hoverTitleEl.innerHTML = titles[idx];
//   hoverTitleEl.style.display = 'block'
//   titleEl.style.display = 'none';
// }

window['revealTitle'] = () => {
  if (hoverTimeout) 
    clearTimeout(hoverTimeout);

  hoverTimeout = setTimeout(showTitle, 1000);
}

function showTitle () {
  titleEl.style.display = 'block';
  hoverTitleEl.style.display = 'none'
}


const dialogPolyfill = require("dialog-polyfill");

const frozenStar = new Howl({
  src: [
    `sound/frozen_star.webm`,
    `sound/frozen_star.mp3`
  ],
  loop: true,
  volume: 0.5
});

let isHQ = true;
let hasHQ = false;


const fadeInApp = new Tweenable();
fadeInApp.setConfig({
  from: { opacity: 0 },
  to: { opacity: 1 },
  easing: "easeOutSine",
  duration: 2500,
  step: state => (frame.style.opacity = state.opacity)
});

console.log(`
  Scale of the Universe 2.1

  Created by Cary Huang
  Implemented by Matthew Martori @matttt on github
  
  Made with ♥️
`)

if(isMobile(window.navigator).phone) {
  alert('This version of Scale of the Universe 2 is not designed for phones. Please find the app on the iOS app store.')
  document.write('Download the Scale of the Universe iOS app!')
  document.getElementById('modal').style.opacity = '0';
};

const modal: any = document.getElementById("modal");

// modal.showModal();

// let n = 0;
// const fadeOut = new Tweenable();
// fadeOut.setConfig({
//   from: { opacity: 1 },
//   to: { opacity: 0 },
//   easing: "easeInOutSine",
//   duration: 500,
//   step: state => (titleEl.style.opacity = state.opacity)
// });

// const fadeIn = new Tweenable();
// fadeIn.setConfig({
//   from: { opacity: 0 },
//   to: { opacity: 1 },
//   easing: "easeInOutSine",
//   duration: 500,
//   step: state => (titleEl.style.opacity = state.opacity)
// });

// let titleCaroselTimeout;

// function titleCarosel() {
//   titleEl.textContent = titles[n++ % (titles.length - 1)];
//   fadeIn.tween().then(
//    titleCaroselTimeout = setTimeout(() => {
//       fadeOut.tween().then();
//     }, 2000)
//   );
// }

const muteToggle:any = document.querySelector('.speaker');
let isMuted = false;
muteToggle.onclick = function (ev) {
  ev.preventDefault();
  isMuted = !isMuted;
  muteToggle.classList.toggle('mute')
  Howler.mute(isMuted)
}


// titleCarosel();
// const titleCaroselInterval = setInterval(titleCarosel, 3000);

const frame = document.getElementById("frame");
const sotuFrame = document.getElementById("sotu");

const startWrapper = document.getElementById("startWrapper");

const loader = new PIXI.Loader();

loader.add("assetsLow", `img/textures/quarter_items-0-main.json`);

dialogPolyfill.registerDialog(modal);

const globalResolution = 1;


const loadingSpin:any = document.getElementById("loadingSpin");

loader.load(async (loader, resources) => {
  loadingSpin.visibility = 'hidden';
  loadingSpin.remove();

  await ensureFontsLoaded();

  let app;
  let slider: Slider | undefined;
  let universe: Universe | undefined;
  let scaleText: ScaleText | undefined;
  let creditText: CreditText | undefined;

  try {
    app = new PIXI.Application({
      width: frame.offsetWidth,
      height: frame.offsetHeight,
      // backgroundColor: 0xffffff,
      antialias: true,
      transparent: true,
      // autoDensity: true,
      powerPreference: "high-performance",
      resolution: globalResolution,
      // forceFXAA: true,
      sharedTicker:true,
      resizeTo: sotuFrame
    });




  } catch (err) {
    console.log(err)
    app = new PIXI.Application({
      width: frame.offsetWidth,
      height: frame.offsetHeight,
      backgroundColor: 0xffffff,
      antialias: true,
      // autoDensity: true,
      forceCanvas: true,
      transparent: true,
      resolution: globalResolution
    });

  }
  
  const w: number = app.renderer.width;
  const h: number = app.renderer.height;
  
  slider = new Slider(app, w, h, globalResolution, onChange, onHandleClicked);
  slider.init();
  
  universe = new Universe(0, slider, app);
  
  scaleText = new ScaleText((w * 0.9) / globalResolution, (slider.topY - 40), "0");

  creditText = new CreditText(w*0.07, h - (100 + (h*0.05)) - 40);

  const onAppResize = throttle(() => {
    try {
      updateVhVar();
      updateOrientationClass();

      // PIXI usually handles resizeTo, but iOS/WeChat can be inconsistent with visualViewport changes.
      const nextW = frame.offsetWidth;
      const nextH = frame.offsetHeight;
      if (nextW > 0 && nextH > 0) {
        app.renderer.resize(nextW, nextH);
      }

      const rw = app.renderer.width;
      const rh = app.renderer.height;

      slider?.resize(rw, rh, globalResolution);
      universe?.resizeViewport();
      scaleText?.setPosition((rw * 0.9) / globalResolution, (slider?.topY ?? 0) - 40);
      creditText?.setPosition(rw * 0.07, rh - (100 + (rh * 0.05)) - 40);
    } catch (e) {
      // ignore resize errors on older browsers
    }
  }, 200);

  window.addEventListener("resize", onAppResize, { passive: true } as any);
  window.addEventListener("orientationchange", () => setTimeout(onAppResize, 350), { passive: true } as any);
  (window as any).visualViewport?.addEventListener?.("resize", onAppResize, { passive: true } as any);

  // WeChat iOS webview is prone to broken canvas sizing / dialog positioning after rotation.
  // A controlled reload is the most reliable fix for older iPad devices.
  if (isIPad && isWeChat) {
    let reloadTimer: any;
    window.addEventListener("orientationchange", () => {
      if (!hasPickedLang) return;
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => location.reload(), 500);
    });
  }

  const highLoader = new PIXI.Loader();

  const highJSONCount = 5;
  for (let i = 0; i <= highJSONCount; i++) {
    highLoader.add(`main${i}`, `img/textures/new_items_${i}.json`);
  }

  highLoader.load(async (highLoader, highResources) => {
    const hqToggle:any = document.querySelector('#hqToggle');
   
    isHQ = true
    hasHQ = true;
    allHighTextures = {}
    for (let key of Object.keys(highResources)) {

      if (!key.includes('_image'))
        allHighTextures = { ...allHighTextures, ...highResources[key].textures };
    
    }
    hqToggle.classList.add('hd-click')
    if (hasPickedLang) {
      universe.hydrateHighTextures(allHighTextures);
    }
  })
  

  const hqToggle:any = document.querySelector('#hqToggle');
  hqToggle.onclick = function (ev) {
    ev.preventDefault();

    isHQ = !isHQ;

    if (!isHQ) {
      highLoader.reset();
      universe.clearHighQualityTextures()
      hqToggle.classList.remove('hd-click')

    } else {
      hqToggle.classList.add('hd-click')

      for (let i = 0; i <= 5; i++) {
        highLoader.add(`main${i}`, `img/textures/new_items_${i}.json`);
      }
    }

    universe.setQuality(isHQ)
  }

  let buttons = document.getElementById('buttons');

  
  const spaceBg = document.getElementById('spaceBgImage')
  const earthBg = document.getElementById('earthBgImage')
  function onChange(x: number, percent: number) {
    let scaleExp = percent * 62 - 35; //range of 10^-35 to 10^27
  
    scaleText.setColor(scaleExp);
    creditText.setColor(scaleExp);

    if(scaleExp > 5 && scaleExp < 7) {
      let opacity = map(scaleExp, 5, 7, 0.1, 100);

      let opacityNorm = opacity / 100;

      buttons.style.filter = `invert(${opacity}%)`;
      spaceBg.style.opacity = `${opacityNorm}`;
      // earthBg.style.opacity = `${1 - opacityNorm}`;
    } else {
      if (buttons.style.filter)
        delete buttons.style.filter;
    }

  
    universe.update(scaleExp);
  
    scaleText.setText(`${Math.round(scaleExp * 10) / 10}`);
  }
  
  function onHandleClicked() {
    universe.onHandleClicked();
  } 

  // Default to Chinese (Simplified) + English always (no language picker).
  const DEFAULT_ZH_LANG = 4;
  const [textData, englishTextData] = await Promise.all([
    (await (await fetch(`data/languages/l${DEFAULT_ZH_LANG}.txt`)).text())
      .split("\n")
      .map((x) => x.replace(/\r?\n|\r/g, "")),
    (await (await fetch(`data/languages/l0.txt`)).text())
      .split("\n")
      .map((x) => x.replace(/\r?\n|\r/g, "")),
  ]);

  // start us at scale 0
  slider.setPercent(map(0.1, -35, 27, 0, 1));

  app.stage.addChild(
    universe.container,
    slider.container,
    scaleText.container,
    creditText.container,
    universe.displayContainer
  );

  sotuFrame.appendChild(app.view);

  setTrilingualElement(titleEl, textData[619], englishTextData[619]);
  titleEl.style.opacity = '1';

  const startButtonText = textData[622];
  const startButton = document.querySelector('#startBtn');
  setTrilingualElement(startButton, startButtonText, englishTextData[622]);

  setTrilingualElement(document.getElementById("moveSliderText"), textData[620], englishTextData[620]);
  setTrilingualElement(document.getElementById("clickObjectText"), textData[621], englishTextData[621]);

  await ensureFontsLoaded();

  await universe.createItems(resources, textData, englishTextData || undefined);

  slider.setPercent(map(0, -35, 27, 0, 1));
  universe.prevZoom = 0;

  hasPickedLang = true;
  if (hasHQ) {
    universe.hydrateHighTextures(allHighTextures);
  }

  window["startSOTU"] = () => {
    modal.close();
    frame.style.visibility = "visible";
    
    fadeInApp.tween().then();

    frozenStar.play();
  }

  
});

// let loadingBar = new ldBar("#loadingBar");

// loader.onLoad.add(() => {
//   loadingBar.set(loader.progress)
// });
