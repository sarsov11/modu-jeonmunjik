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
  var NOTED = {"bm_1": "ccadd7", "bm_2": "e6aa8c", "bm_3": "ccfbbc", "bm_4": "3cbd1d", "cp_acct": "5f551a", "cp_biz": "20c22e", "cp_comm": "b8cbaf", "cp_econ": "9b1bd8", "cp_tax": "16533a", "gs_acct": "ec1a87", "gs_eng": "2c6fce", "gs_law": "c0a972", "gs_tax": "71f30d", "nm_biz": "f34ddf", "nm_civil": "6f0661", "nm_econ": "1a7c9f", "nm_labor1": "825639", "nm_labor2": "42ae8e", "nm_social": "7aac38", "pt_civil": "18132c", "pt_iplaw": "2c734e", "pt_natsci": "eb61e3", "sm_acct": "8d578c", "sm_admin": "512189", "sm_civil": "3bed2e", "sm_comm": "61a095", "sm_tax": "2e3bc0"};
  var EXPLED = {"bm_1": "101c38", "bm_2": "e4ea87", "bm_3": "23b2f5", "bm_4": "817e6e", "cp_acct": "f9e976", "cp_biz": "c5e210", "cp_comm": "e8d18a", "cp_econ": "573546", "cp_tax": "f9987d", "gs_acct": "47b4c7", "gs_eng": "7da416", "gs_law": "374e51", "gs_tax": "842627", "nm_biz": "3d212d", "nm_civil": "4a135c", "nm_econ": "a598a4", "nm_labor1": "3ae866", "nm_labor2": "579d0c", "nm_social": "9cdb34", "pt_civil": "5f0e47", "pt_iplaw": "d7e612", "pt_natsci": "bb5582", "sm_acct": "80ed2f", "sm_admin": "b5e150", "sm_civil": "13ff15", "sm_comm": "195119", "sm_fin": "a4467c", "sm_tax": "c5412d"};
  if (cur && NOTED[cur]) document.write('<script src="data/notes/' + cur + '.js?v=' + NOTED[cur] + '"><\/script>');
  /* 틀린 문장 해설(data/expl/<id>.js → window.EXPL: 문장 id → {f 바른 문장, w 이유}) */
  if (cur && EXPLED[cur]) document.write('<script src="data/expl/' + cur + '.js?v=' + EXPLED[cur] + '"><\/script>');
})();
