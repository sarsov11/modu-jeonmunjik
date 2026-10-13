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
  var NOTED = {"gs_acct": "89b9fa", "gs_eng": "58319e", "gs_law": "0a61b6", "gs_tax": "5d0ba1", "nm_biz": "f34ddf", "nm_civil": "6f0661", "nm_econ": "1a7c9f", "nm_labor1": "825639", "nm_labor2": "42ae8e", "nm_social": "7aac38", "pt_iplaw": "e6476f", "pt_natsci": "eb61e3", "sm_acct": "8d578c"};
  var EXPLED = {"bm_1": "f85015", "bm_2": "a7059f", "bm_3": "82a9f3", "bm_4": "640ee2", "cp_acct": "585205", "cp_biz": "c5e210", "cp_comm": "8cb5eb", "cp_econ": "37f408", "cp_tax": "ed723c", "gs_acct": "47b4c7", "gs_eng": "7da416", "gs_law": "9b5748", "gs_tax": "875b27", "nm_biz": "3d212d", "nm_civil": "9e6452", "nm_econ": "3eddac", "nm_labor1": "3ae866", "nm_labor2": "579d0c", "nm_social": "7591f4", "pt_civil": "e33385", "pt_iplaw": "c55ace", "pt_natsci": "bb5582", "sm_acct": "34480c", "sm_admin": "b1bf84", "sm_civil": "94ec73", "sm_comm": "c85a53", "sm_fin": "a2f583", "sm_tax": "463b14"};
  if (cur && NOTED[cur]) document.write('<script src="data/notes/' + cur + '.js?v=' + NOTED[cur] + '"><\/script>');
  /* 틀린 문장 해설(data/expl/<id>.js → window.EXPL: 문장 id → {f 바른 문장, w 이유}) */
  if (cur && EXPLED[cur]) document.write('<script src="data/expl/' + cur + '.js?v=' + EXPLED[cur] + '"><\/script>');
})();
