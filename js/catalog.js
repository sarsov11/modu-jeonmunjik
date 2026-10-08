/* ═══════════════════════════════════════════════════════════
   모두의 전문직 — 전문직 1차 시험 · 과목 목록 (2026-10-08, 모두의 자격 엔진 재사용)

   기출: 큐넷 전문자격 공개 문제·최종정답(공공누리 1유형, 출처 표시). 수집·검증·단원 배정은
   Desktop\테라러닝_허브\수집\전문자격 + cloud-work jobs/terra-apps (시험마다 claude/terra-jg-NN).
   ★ 2027년 시험일은 공고 전 — 모두 「예상」. 학생이 설정에서 바꿀 수 있다.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  /* 시험 순서 = 대표님 지시(2026-10-08): 노무사 → 법무사 → 관세사 → 변리사 → 세무사 → 회계사.
     과목 id 접두어: nm 노무사 · bm 법무사 · gs 관세사 · pt 변리사 · sm 세무사 · cp 회계사.
     자료(data/<id>.js)가 없는 과목은 「준비 중」으로 흐리게 보인다.
     pass: abs = 과목 40점·평균 60점 절대평가, rel = 과락 넘긴 사람 중 고득점순(커트라인은 strategy.html). */
  var SUBJECTS = {
    nm_labor1: { name: "노동법Ⅰ" }, nm_labor2: { name: "노동법Ⅱ" }, nm_civil: { name: "민법" },
    nm_social: { name: "사회보험법" }, nm_biz: { name: "경영학개론" }, nm_econ: { name: "경제학원론" },
    bm_1: { name: "헌법·상법" }, bm_2: { name: "민법·가족관계등록법" },
    bm_3: { name: "민사집행법·상업등기법·비송" }, bm_4: { name: "부동산등기법·공탁법" },
    gs_law: { name: "관세법개론" }, gs_eng: { name: "무역영어" }, gs_tax: { name: "내국소비세법" }, gs_acct: { name: "회계학" },
    pt_iplaw: { name: "산업재산권법" }, pt_civil: { name: "민법개론" }, pt_natsci: { name: "자연과학개론" },
    sm_fin: { name: "재정학" }, sm_tax: { name: "세법학개론" }, sm_acct: { name: "회계학개론" },
    sm_comm: { name: "상법(선택)" }, sm_civil: { name: "민법(선택)" }, sm_admin: { name: "행정소송법(선택)" },
    cp_biz: { name: "경영학" }, cp_econ: { name: "경제원론" }, cp_comm: { name: "상법" }, cp_tax: { name: "세법개론" }, cp_acct: { name: "회계학" }
  };

  /* 시험일은 2027년 공고 전 — 전부 예상(설정에서 바꿀 수 있다) */
  var EXAMS = [
    { id: "nomusa", name: "공인노무사", sub: "1차", date: "2027-05-22", pass: "abs",
      series: [
        { id: "biz", name: "경영학 선택", subs: ["nm_labor1", "nm_labor2", "nm_civil", "nm_social", "nm_biz"] },
        { id: "econ", name: "경제학 선택", subs: ["nm_labor1", "nm_labor2", "nm_civil", "nm_social", "nm_econ"] }
      ] },
    { id: "beopmu", name: "법무사", sub: "1차", date: "2027-06-26", pass: "rel", subs: ["bm_1", "bm_2", "bm_3", "bm_4"] },
    { id: "gwanse", name: "관세사", sub: "1차", date: "2027-04-03", pass: "abs", subs: ["gs_law", "gs_eng", "gs_tax", "gs_acct"] },
    { id: "patent", name: "변리사", sub: "1차", date: "2027-02-27", pass: "rel", subs: ["pt_iplaw", "pt_civil", "pt_natsci"] },
    { id: "semusa", name: "세무사", sub: "1차", date: "2027-04-24", pass: "abs",
      series: [
        { id: "comm", name: "상법 선택", subs: ["sm_fin", "sm_tax", "sm_acct", "sm_comm"] },
        { id: "civil", name: "민법 선택", subs: ["sm_fin", "sm_tax", "sm_acct", "sm_civil"] },
        { id: "admin", name: "행정소송법 선택", subs: ["sm_fin", "sm_tax", "sm_acct", "sm_admin"] }
      ] },
    { id: "cpa", name: "공인회계사", sub: "1차", date: "2027-02-28", pass: "rel", subs: ["cp_biz", "cp_econ", "cp_comm", "cp_tax", "cp_acct"] }
  ];

  function exam(id) { return EXAMS.filter(function (e) { return e.id === id; })[0] || null; }
  function series(examId, sid) {
    var e = exam(examId); if (!e || !e.series) return null;
    return e.series.filter(function (s) { return s.id === sid; })[0] || null;
  }
  /* 이 학생이 보는 과목들 — 시험·직렬에서 정해진다 */
  function subsOf(examId, sid) {
    var e = exam(examId); if (!e) return [];
    if (!e.series) return e.subs.slice();
    var s = series(examId, sid); return s ? s.subs.slice() : [];
  }
  function ready(id) { return !!(window.READY && window.READY[id]); }
  function count(id) { return (window.READY && window.READY[id] && window.READY[id].n) || 0; }

  window.CATALOG = { SUBJECTS: SUBJECTS, EXAMS: EXAMS, exam: exam, series: series, subsOf: subsOf,
                     ready: ready, count: count,
                     name: function (id) { return (SUBJECTS[id] || { name: id }).name; } };
})();
