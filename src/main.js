import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false


;(function () {
  var docEl = document.documentElement;
  var resize = 'orientationchange' in window ? 'orientationchange' : 'resize';
  var setRem = function () {
    var screenWidth = docEl.clientWidth || window.screen.width || 360;
    var screenHeight = docEl.clientHeight || window.screen.Height || 360;
    var remWidth = screenWidth<screenHeight ? screenWidth :screenHeight;
    docEl.style.fontSize = (100 * screenWidth / 750) + 'px';
  };
  window.addEventListener('resize', setRem, false);
  document.addEventListener('DOMContentLoaded', setRem, false);
  setRem();
})();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
