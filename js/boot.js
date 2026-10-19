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
  var NOTED = {"bm_1": "ccadd7", "bm_2": "e6aa8c", "bm_3": "ccfbbc", "bm_4": "3cbd1d", "cp_acct": "5f551a", "cp_biz": "20c22e", "cp_comm": "b8cbaf", "cp_econ": "0ee0a6", "cp_tax": "16533a", "gs_acct": "ec1a87", "gs_eng": "2c6fce", "gs_law": "c0a972", "gs_tax": "71f30d", "nm_biz": "f34ddf", "nm_civil": "6f0661", "nm_econ": "0ee0a6", "nm_labor1": "825639", "nm_labor2": "42ae8e", "nm_social": "b02feb", "pt_civil": "18132c", "pt_iplaw": "2c734e", "pt_natsci": "eb61e3", "sm_acct": "8d578c", "sm_admin": "512189", "sm_civil": "3bed2e", "sm_comm": "61a095", "sm_fin": "9183a2", "sm_tax": "2e3bc0"};
  var EXPLED = {"bm_1": "48c773", "bm_2": "d51bbe", "bm_3": "d9bb3e", "bm_4": "e499c0", "cp_acct": "06fbbe", "cp_biz": "36a282", "cp_comm": "5fb777", "cp_econ": "746f6f", "cp_tax": "21b782", "gs_acct": "47b4c7", "gs_eng": "cc0274", "gs_law": "eebea4", "gs_tax": "de6ef5", "nm_biz": "7c2027", "nm_civil": "2516a5", "nm_econ": "97ae7b", "nm_labor1": "de7a0b", "nm_labor2": "d85265", "nm_social": "a642fa", "pt_civil": "dcaf3a", "pt_iplaw": "126a62", "pt_natsci": "d9ee2d", "sm_acct": "3831f4", "sm_admin": "2ea44c", "sm_civil": "98190d", "sm_comm": "4270fb", "sm_fin": "f9fa0d", "sm_tax": "9a0c50"};
  if (cur && NOTED[cur]) document.write('<script src="data/notes/' + cur + '.js?v=' + NOTED[cur] + '"><\/script>');
  /* 틀린 문장 해설(data/expl/<id>.js → window.EXPL: 문장 id → {f 바른 문장, w 이유}) */
  if (cur && EXPLED[cur]) document.write('<script src="data/expl/' + cur + '.js?v=' + EXPLED[cur] + '"><\/script>');
})();
