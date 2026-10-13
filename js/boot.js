/* 지금 공부하는 과목의 자료(data/<id>.js)를 싣는다 — 화면마다 store.js 앞에 둔다.
   catalog.js · data/ready.js 가 먼저 실려 있어야 한다.
   고른 과목이 아직 준비 중이면, 그 학생 과목 중 준비된 첫 과목 → 그것도 없으면 준비된 아무 과목. */
(function () {
  "use strict";
  var P = {};
  try { P = JSON.parse(localStorage.getItem("mp.pref.v1") || "{}"); } catch (e) {}
  var R = window.READY || {};
  var want = new URLSearchParams(location.search).get("s");
  var cur = want && R[want] ? want : P.cur;
  if (!R[cur]) cur = (P.subs || []).filter(function (s) { return R[s]; })[0] || Object.keys(R)[0];
  if (want && R[want] && P.cur !== want) {
    P.cur = want;
    try { localStorage.setItem("mp.pref.v1", JSON.stringify(P)); } catch (e) {}
  }
  window.JG_CUR = cur;
  if (cur) document.write('<script src="data/' + cur + '.js?v=' + (R[cur].v || "") + '"><\/script>');
  /* 쟁점 요점 정리(data/notes/<id>.js → window.NOTES) — 오늘 공부 첫머리 「먼저 읽기」에 쓴다. 있는 과목만 */
  /* 아래 두 줄은 해설싣기.py 가 고쳐 쓴다 — 손으로 고치지 말 것 */
  var NOTED = {"nm_labor1": "825639", "nm_labor2": "333201"};
  var EXPLED = {"bm_1": "7d2a30", "bm_2": "975b1d", "bm_3": "e4d526", "bm_4": "8c094d", "nm_biz": "f477c3", "nm_civil": "f341ef", "nm_labor1": "d7a5eb", "nm_labor2": "8cc86f", "nm_social": "22e3d5"};
  if (cur && NOTED[cur]) document.write('<script src="data/notes/' + cur + '.js?v=' + NOTED[cur] + '"><\/script>');
  /* 틀린 문장 해설(data/expl/<id>.js → window.EXPL: 문장 id → {f 바른 문장, w 이유}) */
  if (cur && EXPLED[cur]) document.write('<script src="data/expl/' + cur + '.js?v=' + EXPLED[cur] + '"><\/script>');
})();
