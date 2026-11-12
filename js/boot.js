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
  var NOTED = {"bm_1": "ccadd7", "bm_2": "e6aa8c", "bm_3": "ccfbbc", "bm_4": "3cbd1d", "cp_acct": "5f551a", "cp_biz": "20c22e", "cp_comm": "b8cbaf", "cp_econ": "0ee0a6", "cp_tax": "16533a", "gp_acct": "6078d9", "gp_civil": "1fb1ae", "gp_econ": "0ee0a6", "gp_law": "7f7101", "gp_real": "b31ac0", "gs_acct": "ec1a87", "gs_eng": "2c6fce", "gs_law": "c0a972", "gs_tax": "71f30d", "lw_civil": "8cab60", "lw_crim": "014dce", "lw_pub": "cf5be2", "nm_biz": "f34ddf", "nm_civil": "6f0661", "nm_econ": "0ee0a6", "nm_labor1": "825639", "nm_labor2": "42ae8e", "nm_social": "b02feb", "pt_civil": "18132c", "pt_iplaw": "2c734e", "pt_natsci": "eb61e3", "sm_acct": "8d578c", "sm_admin": "512189", "sm_civil": "3bed2e", "sm_comm": "61a095", "sm_fin": "9183a2", "sm_tax": "2e3bc0"};
  var EXPLED = {"bm_1": "48c773", "bm_2": "d51bbe", "bm_3": "d9bb3e", "bm_4": "e499c0", "cp_acct": "06fbbe", "cp_biz": "36a282", "cp_comm": "5fb777", "cp_econ": "746f6f", "cp_tax": "21b782", "gs_acct": "47b4c7", "gs_eng": "cc0274", "gs_law": "eebea4", "gs_tax": "de6ef5", "nm_biz": "7c2027", "nm_civil": "2516a5", "nm_econ": "97ae7b", "nm_labor1": "de7a0b", "nm_labor2": "d85265", "nm_social": "a642fa", "pt_civil": "dcaf3a", "pt_iplaw": "126a62", "pt_natsci": "d9ee2d", "sm_acct": "3831f4", "sm_admin": "2ea44c", "sm_civil": "98190d", "sm_comm": "4270fb", "sm_fin": "f9fa0d", "sm_tax": "9a0c50"};
  /* 도식(data/dosik/<id>.js) 이 있는 과목 — 해설싣기.py 가 고쳐 쓴다. 없는 과목은 문제 화면이 그 파일을 부르지 않는다(404 방지) */
  var DOSIKED = {"bm_1": "0c927c", "bm_2": "9fbd0d", "bm_3": "0b5250", "bm_4": "776c76", "cp_acct": "d25fed", "cp_biz": "e58345", "cp_comm": "dfc2b3", "cp_econ": "537cb1", "cp_tax": "dc2674", "gp_econ": "7e3f3e", "gs_acct": "83600a", "gs_eng": "a56112", "gs_law": "b1c229", "gs_tax": "faeeb4", "nm_biz": "91ddd3", "nm_civil": "19a060", "nm_econ": "265f44", "nm_labor1": "116ae0", "nm_labor2": "e0c208", "nm_social": "c4cc01", "pt_civil": "60b02a", "pt_iplaw": "2374ee", "pt_natsci": "34e09c", "sm_acct": "5287a0", "sm_admin": "a9b36d", "sm_civil": "62250d", "sm_comm": "92ccb4", "sm_fin": "76ae11", "sm_tax": "3d53b1"};
  window.DOSIK_LIST = DOSIKED;
  window.TN_NOTES_URL = false;   /* diagram.js 가 부르는 notes.js 는 이 앱에 없다(404 방지) */
  /* 스킬트리 3단 정리(data/st/<id>.js → window.STREE_DEF: 대단원·중단원 짧은 이름·소주제). 아래 줄은 단원\스킬트리싣기.js 가 고쳐 쓴다 */
  var STREED = {"bm_1":"5aa118","bm_2":"fe1aa4","bm_3":"052d71","bm_4":"8acafc","cp_acct":"add14a","cp_biz":"70875e","cp_comm":"9f6f40","cp_econ":"aadc99","cp_tax":"351072","gs_acct":"c836b4","gs_eng":"8a145d","gs_law":"9b512c","gs_tax":"c83a7c","nm_biz":"7897b3","nm_civil":"cad952","nm_econ":"200e53","nm_labor1":"86bb38","nm_labor2":"9506f6","nm_social":"0beb56","pt_civil":"9f3739","pt_iplaw":"a4a6ad","pt_natsci":"bad81c","sm_acct":"2a3254","sm_admin":"7e14a0","sm_civil":"4b311f","sm_comm":"17bd74","sm_fin":"aedd28","sm_tax":"98f8d7"};
  if (cur && STREED[cur]) document.write('<script src="data/st/' + cur + '.js?v=' + STREED[cur] + '"><\/script>');
  if (cur && NOTED[cur]) document.write('<script src="data/notes/' + cur + '.js?v=' + NOTED[cur] + '"><\/script>');
  /* 틀린 문장 해설(data/expl/<id>.js → window.EXPL: 문장 id → {f 바른 문장, w 이유}) */
  if (cur && EXPLED[cur]) document.write('<script src="data/expl/' + cur + '.js?v=' + EXPLED[cur] + '"><\/script>');
  /* 개념어(1110) — 문제 화면(tera-q 가 실린 화면)만. 파일이 없는 과목은 조용히 넘어간다(onerror) */
  if (cur && window.TERA_Q) document.write('<script src="data/terms/' + cur + '.js?v=1112b" onerror="void 0"><\/script><script>try{(window.TNQ||[]).forEach(function(x){if(x&&x.terms)TERA_Q.terms(x.terms)})}catch(e){}<\/script>');
})();
