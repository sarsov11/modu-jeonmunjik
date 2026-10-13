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
  var NOTED = {"nm_labor1": "825639", "nm_labor2": "42ae8e"};
  var EXPLED = {"bm_1": "563bf3", "bm_2": "5c5b32", "bm_3": "d3330d", "bm_4": "08fc1f", "cp_acct": "6ae702", "cp_biz": "5bde76", "cp_comm": "d5b1e7", "cp_econ": "fa5dfd", "cp_tax": "f6471f", "gs_acct": "c6c2f6", "gs_eng": "092a66", "gs_law": "8d5f18", "gs_tax": "db373b", "nm_biz": "167b8e", "nm_civil": "9cd7f2", "nm_econ": "3eddac", "nm_labor1": "3e11f5", "nm_labor2": "7fa510", "nm_social": "9cab57", "pt_civil": "b6bfd9", "pt_iplaw": "12fca0", "pt_natsci": "c7b932", "sm_acct": "4e5884", "sm_admin": "1e6ab6", "sm_civil": "9188c0", "sm_comm": "04c6c8", "sm_fin": "44ea78", "sm_tax": "ae9634"};
  if (cur && NOTED[cur]) document.write('<script src="data/notes/' + cur + '.js?v=' + NOTED[cur] + '"><\/script>');
  /* 틀린 문장 해설(data/expl/<id>.js → window.EXPL: 문장 id → {f 바른 문장, w 이유}) */
  if (cur && EXPLED[cur]) document.write('<script src="data/expl/' + cur + '.js?v=' + EXPLED[cur] + '"><\/script>');
})();
