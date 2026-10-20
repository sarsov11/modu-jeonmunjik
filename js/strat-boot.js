/* 합격전략 브리핑 연결 (2026-10-20) — 엔진 js/zzstrat.js(허브 공용 원본 복사), 자료 js/strat/<시험id>.js
   2차는 js/strat/jm2.js 하나에 jm2_<시험코드> 로 들어 있다. 원본은 테라러닝_허브\공용\전략\ */
(function () {
  "use strict";
  var 대기 = {};
  window.STRATLOAD = function (id, cb) {
    if (!window.ZZSTRAT) return;
    if (ZZSTRAT.data[id]) { if (cb) cb(); return; }
    var file = id.indexOf("jm2_") === 0 ? "jm2" : id;
    if (대기[file]) { 대기[file].push(cb); return; }
    대기[file] = [cb];
    var s = document.createElement("script");
    s.src = "js/strat/" + file + ".js?v=1021";
    s.onload = function () { var l = 대기[file]; 대기[file] = null; l.forEach(function (f) { if (f) f(); }); };
    s.onerror = function () { 대기[file] = null; };
    document.head.appendChild(s);
  };
  /* 처음이면 튜토리얼, 이후엔 구석 「합격전략」 버튼. 자료 없는 시험이면 버튼을 치운다 */
  window.STRATAUTO = function (id) {
    STRATLOAD(id, function () {
      if (ZZSTRAT.data[id]) ZZSTRAT.auto(id);
      else { var f = document.querySelector(".zs-fab"); if (f) f.remove(); }
    });
  };
})();
