/* 분개 드릴 색인 (2026-11-10) — 만든 곳: _작업/분개생성.py. 오늘 화면 · 개념 끝 · 기출 결과 · 합격 지도가 부른다.
   기록은 journal.js 와 같은 localStorage `mp.jdrill.v1`(거래마다 상자 0~5, 계정의 거래가 모두 3 이상이면 「익힘」). */
(function () {
  "use strict";
  var KEY = "mp.jdrill.v1", RK = "mp.jdrill.read.v1", U = [{"id": "ppe", "name": "유형자산", "map": {"cp_acct": [4, 5], "sm_acct": [4, 5], "gs_acct": [4, 5]}, "accts": [{"n": "토지", "ids": ["ppe-001", "ppe-002", "ppe-003", "ppe-004", "ppe-005", "ppe-006", "ppe-007"]}, {"n": "건설중인자산", "ids": ["ppe-008", "ppe-009", "ppe-010", "ppe-011", "ppe-012", "ppe-013", "ppe-014"]}, {"n": "기계장치", "ids": ["ppe-015", "ppe-016", "ppe-017", "ppe-018", "ppe-019", "ppe-020", "ppe-021", "ppe-022"]}, {"n": "건물", "ids": ["ppe-023", "ppe-024", "ppe-025", "ppe-026", "ppe-027", "ppe-028"]}, {"n": "감가상각누계액", "ids": ["ppe-029", "ppe-030", "ppe-031", "ppe-032", "ppe-033", "ppe-034", "ppe-035", "ppe-036", "ppe-037", "ppe-038"]}, {"n": "정부보조금(자산차감)", "ids": ["ppe-039", "ppe-040", "ppe-041", "ppe-042", "ppe-043", "ppe-044"]}, {"n": "재평가잉여금", "ids": ["ppe-045", "ppe-046", "ppe-047", "ppe-048", "ppe-049", "ppe-050", "ppe-051", "ppe-052", "ppe-053"]}, {"n": "손상차손누계액", "ids": ["ppe-054", "ppe-055", "ppe-056", "ppe-057", "ppe-058", "ppe-059", "ppe-060"]}, {"n": "유형자산처분손실", "ids": ["ppe-061", "ppe-062", "ppe-063", "ppe-064", "ppe-065", "ppe-066"]}]}, {"id": "inv", "name": "재고자산", "map": {"cp_acct": [3], "sm_acct": [3], "gs_acct": [3]}, "accts": [{"n": "상품", "ids": ["inv-001", "inv-002", "inv-003", "inv-004", "inv-005", "inv-006", "inv-007", "inv-008", "inv-009"]}, {"n": "매입", "ids": ["inv-010", "inv-011", "inv-012", "inv-013", "inv-014", "inv-015", "inv-016"]}, {"n": "재고자산감모손실(정상)", "ids": ["inv-017", "inv-018", "inv-019", "inv-020", "inv-021", "inv-022", "inv-023"]}, {"n": "재고자산평가충당금", "ids": ["inv-024", "inv-025", "inv-026", "inv-027", "inv-028", "inv-029", "inv-030"]}, {"n": "적송품", "ids": ["inv-031", "inv-032", "inv-033", "inv-034", "inv-035", "inv-036"]}, {"n": "시송품", "ids": ["inv-037", "inv-038", "inv-039", "inv-040", "inv-041", "inv-042"]}, {"n": "미착품", "ids": ["inv-043", "inv-044", "inv-045", "inv-046", "inv-047", "inv-048"]}]}, {"id": "bond", "name": "사채와 금융부채", "map": {"cp_acct": [8], "sm_acct": [8], "gs_acct": [8]}, "accts": [{"n": "사채", "ids": ["bond-001", "bond-002", "bond-003", "bond-004", "bond-005", "bond-006", "bond-007"]}, {"n": "사채할인발행차금", "ids": ["bond-008", "bond-009", "bond-010", "bond-011", "bond-012", "bond-013", "bond-014", "bond-015"]}, {"n": "사채할증발행차금", "ids": ["bond-016", "bond-017", "bond-018", "bond-019", "bond-020", "bond-021"]}, {"n": "이자비용", "ids": ["bond-022", "bond-023", "bond-024", "bond-025", "bond-026", "bond-027", "bond-028", "bond-029"]}, {"n": "사채상환손실", "ids": ["bond-030", "bond-031", "bond-032", "bond-033", "bond-034", "bond-035"]}, {"n": "사채상환이익", "ids": ["bond-036", "bond-037", "bond-038", "bond-039", "bond-040", "bond-041"]}]}];
  var SUBJ = { cp_acct: 1, sm_acct: 1, gs_acct: 1 };
  function rd(k) { try { return JSON.parse(localStorage.getItem(k) || "null") || {}; } catch (e) { return {}; } }
  function box(id) { var s = rd(KEY); return (s.b && s.b[id] && s.b[id].b) || 0; }
  function key() { return (window.TREE && TREE.key) || ""; }
  function on() { return !!SUBJ[key()]; }
  function mastered(a) { return a.ids.every(function (id) { return box(id) >= 3; }); }
  function done(a) { return a.ids.filter(function (id) { return box(id) >= 3; }).length; }
  function unitsFor(no) { var k = key(); return U.filter(function (u) { return (u.map[k] || []).indexOf(+no) >= 0; }); }
  function unitsForKey(k, nos) { return U.filter(function (u) { return (u.map[k] || []).some(function (no) { return nos.indexOf(no) >= 0; }); }); }
  function nextAcct(u) { for (var i = 0; i < u.accts.length; i++) if (!mastered(u.accts[i])) return u.accts[i]; return null; }
  function count(u) { return u.accts.reduce(function (s, a) { return s + a.ids.length; }, 0); }
  function markRead(no) { var r = rd(RK); r[no] = Date.now(); try { localStorage.setItem(RK, JSON.stringify(r)); } catch (e) {} }
  /* 지금 배우는 단원 = 가장 최근에 개념을 읽었거나 기출을 푼 회계 단원에 이어진 분개 단원. 없으면 번호가 앞선 단원 */
  function current() {
    if (!on()) return null;
    var k = key(), r = rd(RK), best = null, bt = -1;
    U.forEach(function (u) {
      (u.map[k] || []).forEach(function (no) {
        var t = r[no] || 0;
        try { if (window.GB && GB.nodeStat) { var st = GB.nodeStat(no); if (st && st.last && st.last > t) t = st.last; } } catch (e) {}
        if (t > bt || (t === bt && best && (u.map[k][0] < best.map[k][0]))) { bt = t; best = u; }
      });
    });
    if (!best) return null;
    var order = [best].concat(U.filter(function (u) { return u !== best; })), pick = null;
    for (var i = 0; i < order.length; i++) { var a = nextAcct(order[i]); if (a) { pick = { unit: order[i], acct: a }; break; } }
    if (!pick) return { unit: best, acct: best.accts[0], all: true };
    return pick;
  }
  function href(u, a) { return "journal.html?u=" + u.id + (a ? "&a=" + encodeURIComponent(a.n) : ""); }
  window.JREC = { units: U, on: on, current: current, unitsFor: unitsFor, unitsForKey: unitsForKey, nextAcct: nextAcct, count: count, done: done, mastered: mastered, markRead: markRead, href: href, box: box };
})();
