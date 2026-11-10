/* ═══════════════════════════════════════════════════════════
   모두의 전문직 — 분개 드릴 화면 (2026-11-10)
   계정을 배울 때마다 그 계정의 거래를 분개로 되풀이한다.
   자료 js/journal-data.js(JDRILL) · 색인 js/journal-rec.js(JREC) · 기록 localStorage `mp.jdrill.v1`
   거래마다 상자 0~5(맞히면 한 칸 위, 틀리면 0). 계정의 거래가 모두 3 이상이면 「익힘」.
   헷갈림을 켜고 맞힌 거래는 상자를 올리지 않는다.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var J = window.JDRILL, A = window.ACCT, KEY = "mp.jdrill.v1";
  if (window.GB) GB.mountNav("drill.html");
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function won(n) { return Number(n).toLocaleString("ko-KR"); }

  var BY = {};
  A.ACCTS.forEach(function (a) { BY[a.n] = a; });
  J.extra.forEach(function (a) { BY[a.n] = a; });
  var UNIT = {}; J.units.forEach(function (u) { UNIT[u.id] = u; });
  var ITEM = {}; J.items.forEach(function (it) { ITEM[it.id] = it; });
  function itemsOf(u, a) { return J.items.filter(function (it) { return it.u === u && it.a === a; }); }

  /* ── 기록 ── */
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
  if (!S || typeof S !== "object") S = {};
  if (!S.b) S.b = {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function rec(id) { return S.b[id] || { b: 0, n: 0, w: 0 }; }
  function mastered(u, a) { return itemsOf(u, a).every(function (it) { return rec(it.id).b >= 3; }); }
  function doneN(u, a) { return itemsOf(u, a).filter(function (it) { return rec(it.id).b >= 3; }).length; }
  function put(id, ok, unsure) {
    var r = rec(id); r.n++;
    if (ok) { if (!unsure) r.b = Math.min(5, r.b + 1); } else { r.b = 0; r.w++; }
    S.b[id] = r; save();
  }

  /* ── 섞기(거래마다 같은 후보 순서) ── */
  function seeded(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return function () { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }
  function shuffle(a, rnd) { a = a.slice(); rnd = rnd || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var COMMON = ["현금", "보통예금", "매입채무", "미지급금", "미수금", "매출채권"];
  function candidates(it, k) {
    var st = it.steps[k], ans = [];
    st.d.concat(st.c).forEach(function (x) { if (ans.indexOf(x[0]) < 0) ans.push(x[0]); });
    var pool = ans.slice();
    it.x.forEach(function (n) { if (pool.indexOf(n) < 0 && BY[n]) pool.push(n); });
    var rnd = seeded(it.id + ":" + k), unit = UNIT[it.u];
    var fill = shuffle(unit.accts.concat(COMMON).filter(function (n) { return pool.indexOf(n) < 0 && BY[n]; }), rnd);
    var want = Math.max(8, pool.length + 2);
    while (pool.length < want && fill.length) pool.push(fill.shift());
    return shuffle(pool, rnd);
  }

  /* ── 목록 ── */
  var cur = null;   /* 풀이 중 상태 */
  function setFocus(on) { document.body.classList.toggle("focus", !!on); }
  function setHd(html) { $("hd").innerHTML = html; }
  function showBar(on) {
    $("jbar").hidden = !on;
    document.body.classList.toggle("tq-on", !!on);
    if (!on && window.TERA_PAD && TERA_PAD.penHide) TERA_PAD.penHide();
  }

  function listView() {
    cur = null; setFocus(false); showBar(false);
    setHd("<h1>분개 드릴</h1>");
    var rc = window.JREC && JREC.current ? JREC.current() : null;
    var recKey = rc && !rc.all ? rc.unit.id + "|" + rc.acct.n : null;
    if (!recKey) {   /* 회계 과목이 아니거나 이어진 기록이 없으면 첫 단원의 첫 안 익힌 계정 */
      for (var i = 0; i < J.units.length && !recKey; i++) {
        for (var j = 0; j < J.units[i].accts.length; j++) { var an = J.units[i].accts[j]; if (!mastered(J.units[i].id, an)) { recKey = J.units[i].id + "|" + an; break; } }
      }
    }
    var h = '<div class="jd-cards">';
    J.units.forEach(function (u) {
      var total = J.items.filter(function (it) { return it.u === u.id; }).length;
      h += '<section class="jd-card"><h2>' + esc(u.name) + "<small>" + total + "거래</small></h2><div class=\"jd-rows\">";
      u.accts.forEach(function (a) {
        var m = itemsOf(u.id, a).length, d = doneN(u.id, a), full = d === m;
        h += '<button type="button" class="jd-row' + (full ? " full" : "") + '" data-u="' + u.id + '" data-a="' + esc(a) + '">' +
          '<span class="nm">' + esc(a) + (recKey === u.id + "|" + a ? '<em class="recpill">추천</em>' : "") + "</span>" +
          '<span class="bar"><i style="width:' + Math.round(d / m * 100) + '%"></i></span><span class="n">' + (full ? "익힘" : d + " / " + m) + "</span></button>";
      });
      h += "</div></section>";
    });
    h += "</div>";
    $("main").innerHTML = h;
    Array.prototype.forEach.call($("main").querySelectorAll(".jd-row"), function (b) { b.onclick = function () { start(b.dataset.u, b.dataset.a); }; });
    history.replaceState(null, "", "journal.html");
    window.scrollTo(0, 0);
  }

  /* ── 세션 ── */
  function start(u, a) {
    var items = itemsOf(u, a);
    items = shuffle(items).sort(function (x, y) {
      var rx = rec(x.id), ry = rec(y.id), mx = rx.b >= 3 ? 1 : 0, my = ry.b >= 3 ? 1 : 0;
      return mx - my || rx.b - ry.b || x.lv - y.lv;
    }).slice(0, 8);
    cur = { u: u, a: a, items: items, i: 0, ok: 0, res: [] };
    try { history.replaceState(null, "", "journal.html?u=" + u + "&a=" + encodeURIComponent(a)); } catch (e) {}
    openItem();
  }
  function openItem() {
    var it = cur.items[cur.i];
    cur.step = 0; cur.past = []; cur.conf = false; cur.itemOk = true; cur.finished = false;
    newStep();
    if (window.TERA_PAD && TERA_PAD.penHide) TERA_PAD.penHide();
    var pen = $("jPen"); if (pen) pen.classList.remove("is-on");
    draw(); window.scrollTo(0, 0);
  }
  function newStep() {
    cur.rows = { d: [{ acct: "", amt: "" }], c: [{ acct: "", amt: "" }] };
    cur.active = { side: "d", idx: 0 };
    cur.checked = null;
    cur.cands = candidates(cur.items[cur.i], cur.step);
  }

  /* ── 채점 ── */
  function amtOf(s) { return parseInt(String(s || "").replace(/[^0-9]/g, ""), 10) || 0; }
  function gradeStep(st, rows) {
    var out = { d: [], c: [], miss: [], ok: true };
    var left = { d: st.d.map(function (x, i) { return { a: x[0], v: x[1], used: false }; }), c: st.c.map(function (x) { return { a: x[0], v: x[1], used: false }; }) };
    ["d", "c"].forEach(function (side) {
      rows[side].forEach(function (r, i) {
        var v = amtOf(r.amt);
        if (!r.acct && !v) { out[side][i] = { blank: true }; return; }
        var hit = left[side].filter(function (x) { return !x.used && x.a === r.acct && x.v === v; })[0];
        if (hit) { hit.used = true; out[side][i] = { ok: true }; }
        else out[side][i] = { ok: false, row: r, v: v };
      });
    });
    ["d", "c"].forEach(function (side) {
      var other = side === "d" ? "c" : "d";
      rows[side].forEach(function (r, i) {
        var g = out[side][i]; if (g.blank || g.ok) return;
        out.ok = false;
        var sameAcct = left[side].filter(function (x) { return !x.used && x.a === r.acct; })[0];
        var opp = left[other].filter(function (x) { return !x.used && x.a === r.acct; })[0];
        g.why = !r.acct ? "계정을 고르세요" : sameAcct ? "금액이 다릅니다" : opp ? "차변 · 대변이 바뀌었습니다" : "이 거래에 없는 계정입니다";
      });
    });
    ["d", "c"].forEach(function (side) { left[side].forEach(function (x) { if (!x.used) { out.ok = false; out.miss.push(side + "|" + x.a + "|" + x.v); } }); });
    var any = rows.d.concat(rows.c).some(function (r) { return r.acct || amtOf(r.amt); });
    if (!any) out.ok = false;
    return out;
  }

  /* ── 풀이 화면 ── */
  var LV = { 1: "계정 고르기", 2: "금액 계산", 3: "이어지는 거래" };
  var CIR = ["①", "②", "③", "④"];
  function lineHtml(side, i, r) {
    var g = cur.checked && cur.checked[side][i], cls = "jd-line" + (g && !g.blank ? (g.ok ? " ok" : " no") : "") + (!cur.checked && cur.active.side === side && cur.active.idx === i ? " on" : "");
    var dis = cur.checked ? " disabled" : "";
    return '<div class="' + cls + '" data-s="' + side + '" data-i="' + i + '">' +
      '<button type="button" class="jd-acc' + (r.acct ? " has" : "") + '"' + dis + ">" + esc(r.acct || "계정 고르기") + "</button>" +
      '<input class="jd-amt" type="text" inputmode="numeric" autocomplete="off" placeholder="금액" aria-label="금액" value="' + esc(r.amt) + '"' + dis + ">" +
      '<button type="button" class="jd-x" aria-label="줄 지우기"' + (cur.rows[side].length > 1 && !cur.checked ? "" : " hidden") + ">✕</button>" +
      (g && !g.blank && !g.ok && g.why ? '<p class="jd-why">' + esc(g.why) + "</p>" : "") + "</div>";
  }
  function sideHtml(side, title) {
    return '<div class="jd-side" data-s="' + side + '"><h3>' + title + "</h3>" + cur.rows[side].map(function (r, i) { return lineHtml(side, i, r); }).join("") +
      (cur.checked ? "" : '<button type="button" class="jd-add" data-s="' + side + '">줄 더하기</button>') + "</div>";
  }
  function answerHtml(st, res) {
    function col(arr, side) {
      return arr.map(function (x) {
        var miss = res.miss.indexOf(side + "|" + x[0] + "|" + x[1]) >= 0;
        return '<p' + (miss ? ' class="miss"' : "") + "><span>" + esc(x[0]) + "</span><b>" + won(x[1]) + "</b></p>";
      }).join("");
    }
    return '<div class="jd-ans"><div class="tf"><div><h4>차변</h4>' + col(st.d, "d") + "</div><div><h4>대변</h4>" + col(st.c, "c") + "</div></div></div>";
  }
  function draw() {
    var it = cur.items[cur.i], st = it.steps[cur.step], multi = it.steps.length > 1, lastStep = cur.step === it.steps.length - 1;
    setFocus(true); showBar(true);
    setHd('<a class="bk" href="journal.html" id="jBack" title="목록" aria-label="목록">‹</a><h1>' + esc(it.a) + '</h1><span class="cnt"></span><a class="x" href="drill.html" title="그만하기">✕</a>');
    var pct = Math.round((cur.i + (cur.finished ? 1 : 0)) / cur.items.length * 100);
    var h = '<div class="tq-prog"><i><u style="width:' + pct + '%"></u></i><span><b>' + (cur.i + 1) + "</b> / " + cur.items.length + "</span></div>" +
      '<div class="tq-meta"><span class="tq-no">' + (cur.i + 1) + '번 거래</span><span class="tq-sp"></span><span class="jd-lv">' + LV[it.lv] + "</span></div>" +
      '<p class="tq-stem" id="jStem">' + esc(it.q) + "</p>" + '<div class="jd-pad padrow" id="jPad"></div>';
    if (multi) {
      if (cur.past.length) h += '<p class="jd-past">' + cur.past.map(function (p, i) { return "<span>" + CIR[i] + " " + esc(it.steps[i].when || "") + " <b class=\"" + (p ? "ok" : "no") + '">' + (p ? "맞음" : "틀림") + "</b></span>"; }).join("") + "</p>";
      h += '<p class="jd-when">' + CIR[cur.step] + " " + (cur.step + 1) + " / " + it.steps.length + (st.when ? " · " + esc(st.when) : "") + "</p>";
    }
    h += sideHtml("d", "차변") + sideHtml("c", "대변");
    if (!cur.checked) {
      h += '<div class="jd-pool" id="jPool">' + cur.cands.map(function (n) { return '<button type="button" class="jd-chip" data-n="' + esc(n) + '">' + esc(n) + "</button>"; }).join("") + "</div>";
      h += '<div class="jd-go"><button type="button" class="btn block" id="jCheck">확인</button></div>';
    } else {
      var res = cur.checked;
      h += '<p class="jd-verdict ' + (res.ok ? "ok" : "no") + '">' + (res.ok ? "맞음" : "틀림") + "</p>" + answerHtml(st, res);
      if (st.calc) h += '<p class="jd-calc">' + esc(st.calc).replace(/ ; /g, "<br>") + "</p>";
      if (st.why) h += '<div class="jd-expl" id="jExpl">' + esc(st.why) + "</div>";
      if (multi && !lastStep) h += '<div class="jd-go"><button type="button" class="btn block" id="jStepNext">다음 시점</button></div>';
    }
    $("main").innerHTML = h;
    wire();
    padButton(it);
    var cnt = cur.items.length;
    $("jPos").innerHTML = (cur.i + 1) + " <small>/ " + cnt + "</small>";
    $("jNext").disabled = !cur.finished;
    $("jExp").disabled = !cur.checked;
    $("jHalf").classList.toggle("is-on", !!cur.conf);
  }
  function padButton(it) {
    var host = $("jPad"); if (!host) return;
    var need = it.lv >= 2 || (window.TERA_PAD && TERA_PAD.isCalc && TERA_PAD.isCalc(it.q));
    if (!need || !window.TERA_PAD) { host.remove(); return; }
    TERA_PAD.button(host, function () { return { key: "jd-" + it.id, title: it.a + " 분개" }; });
  }

  function wire() {
    var main = $("main");
    Array.prototype.forEach.call(main.querySelectorAll(".jd-line"), function (ln) {
      var side = ln.dataset.s, i = +ln.dataset.i, row = cur.rows[side][i];
      var acc = ln.querySelector(".jd-acc"), amt = ln.querySelector(".jd-amt"), x = ln.querySelector(".jd-x");
      acc.onclick = function () { cur.active = { side: side, idx: i }; Array.prototype.forEach.call(main.querySelectorAll(".jd-line"), function (l) { l.classList.remove("on"); }); ln.classList.add("on"); };
      amt.addEventListener("focus", function () { cur.active = { side: side, idx: i }; Array.prototype.forEach.call(main.querySelectorAll(".jd-line"), function (l) { l.classList.remove("on"); }); ln.classList.add("on"); });
      amt.addEventListener("input", function () {
        var d = amt.value.replace(/[^0-9]/g, ""); row.amt = d ? Number(d).toLocaleString("ko-KR") : ""; amt.value = row.amt;
      });
      x.onclick = function () { cur.rows[side].splice(i, 1); if (cur.active.side === side) cur.active.idx = Math.max(0, Math.min(cur.active.idx, cur.rows[side].length - 1)); draw(); };
    });
    Array.prototype.forEach.call(main.querySelectorAll(".jd-add"), function (b) {
      b.onclick = function () { var s = b.dataset.s; cur.rows[s].push({ acct: "", amt: "" }); cur.active = { side: s, idx: cur.rows[s].length - 1 }; draw(); };
    });
    Array.prototype.forEach.call(main.querySelectorAll(".jd-chip"), function (b) {
      b.onclick = function () {
        var s = cur.active.side, i = cur.active.idx; if (!cur.rows[s][i]) { cur.active = { side: "d", idx: 0 }; s = "d"; i = 0; }
        cur.rows[s][i].acct = b.dataset.n;
        var nx = -1; for (var k = 0; k < cur.rows[s].length; k++) { if (!cur.rows[s][k].acct) { nx = k; break; } }
        if (nx >= 0) cur.active = { side: s, idx: nx };
        var y = window.pageYOffset; draw(); window.scrollTo(0, y);
      };
    });
    var ck = $("jCheck"); if (ck) ck.onclick = check;
    var sn = $("jStepNext"); if (sn) sn.onclick = function () { cur.step++; newStep(); draw(); window.scrollTo(0, 0); };
  }

  function check() {
    var it = cur.items[cur.i], st = it.steps[cur.step], res = gradeStep(st, cur.rows);
    cur.checked = res; cur.past.push(res.ok);
    if (!res.ok) cur.itemOk = false;
    if (window.ZZ) { try { if (res.ok) ZZ.ok($("jCheck")); else ZZ.no($("jCheck")); } catch (e) {} }
    if (cur.step === it.steps.length - 1) {
      cur.finished = true;
      put(it.id, cur.itemOk, cur.conf);
      cur.res.push(cur.itemOk); if (cur.itemOk) cur.ok++;
    }
    draw();
    var v = document.querySelector(".jd-verdict"); if (v) v.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function next() {
    if (!cur || !cur.finished) return;
    if (cur.i + 1 < cur.items.length) { cur.i++; openItem(); } else endView();
  }

  function endView() {
    showBar(false); setFocus(true);
    setHd('<a class="bk" href="journal.html" title="목록" aria-label="목록">‹</a><h1>' + esc(cur.a) + '</h1><span class="cnt"></span><a class="x" href="drill.html" title="그만하기">✕</a>');
    var m = mastered(cur.u, cur.a), nextA = null, nu = null;
    var order = J.units.slice().sort(function (a, b) { return (a.id === cur.u ? 0 : 1) - (b.id === cur.u ? 0 : 1); });
    for (var i = 0; i < order.length && !nextA; i++) { for (var j = 0; j < order[i].accts.length; j++) { var an = order[i].accts[j]; if (an !== cur.a && !mastered(order[i].id, an)) { nextA = an; nu = order[i].id; break; } } }
    $("main").innerHTML = '<div class="jd-end"><div class="big">' + cur.ok + " / " + cur.items.length + '</div><div class="sm">' + esc(cur.a) + (m ? " · 익힘" : " · " + doneN(cur.u, cur.a) + " / " + itemsOf(cur.u, cur.a).length) + "</div>" +
      '<div class="acts">' + (nextA ? '<button type="button" class="btn block" id="jMore">다음 · ' + esc(nextA) + "</button>" : '<a class="btn block" href="drill.html">드릴</a>') +
      '<button type="button" class="btn ghost block" id="jList">목록</button></div></div>';
    if ($("jMore")) $("jMore").onclick = function () { start(nu, nextA); };
    $("jList").onclick = listView;
    window.scrollTo(0, 0);
  }

  /* ── 아래 줄 ── */
  $("jNext").onclick = next;
  $("jHalf").onclick = function () { if (!cur || cur.finished) return; cur.conf = !cur.conf; this.classList.toggle("is-on", cur.conf); };
  $("jExp").onclick = function () { var e = $("jExpl") || document.querySelector(".jd-ans"); if (e) e.scrollIntoView({ behavior: "smooth", block: "center" }); };
  $("jPen").onclick = function () {
    if (!window.TERA_PAD || !TERA_PAD.pen || !cur) return;
    var self = this; TERA_PAD.pen({ key: "jd-" + cur.items[cur.i].id, onChange: function (on) { self.classList.toggle("is-on", !!on); } });
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#jBack"); if (b && cur) { e.preventDefault(); listView(); }
  });

  /* ── 들어가기: ?u=단원 [&a=계정] ── */
  var qp = new URLSearchParams(location.search), qu = qp.get("u"), qa = qp.get("a");
  if (qu && UNIT[qu]) {
    if (!qa || UNIT[qu].accts.indexOf(qa) < 0) {
      var na = null; UNIT[qu].accts.forEach(function (an) { if (!na && !mastered(qu, an)) na = an; });
      qa = na || UNIT[qu].accts[0];
    }
    start(qu, qa);
  } else listView();
})();
