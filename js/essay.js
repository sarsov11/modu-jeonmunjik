/* ═══════════════════════════════════════════════════════════
   모두의 전문직 — 2차 답안 훈련 (2026-10-09)
   자료: data2/<시험코드>.js → window.E2 (2차\가져오기2.py 가 기출 + 루브릭을 합쳐 만든다)
   학습 단위 = 득점 요소. 채점 = 요소마다 핵심어 대조(공백·문장부호 무시) → 요소 배점 합.
   네 가지 연습: 쟁점 인출(폰 1분) · 목차 쓰기 · 실전 쓰기(시간 재기) · 계산 단계.
   기록 키 mp.e2.v1 — 다른 사이트 키와 섞지 않는다.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  GB.mountNav("essay.html");
  var app = document.getElementById("app");
  var esc = GB.esc;
  var IDX = window.E2IDX || [];
  var KEY = "mp.e2.v1";
  var BOX_DAYS = [0, 1, 2, 4, 7, 15];
  var R = load();
  var E = null;          /* 지금 시험 자료 */
  var view = { s: null, u: null, more: 0 };
  var timerId = null;
  /* 2차 합격 기준 — 2026-10-09 법령 원문 확인(korean-law). 수치는 조문 그대로, 해석 붙이지 않는다 */
  var PASS2 = {
    nomusa: ["과목마다 만점의 40% 이상, 전 과목 총점의 60% 이상", "인원이 최소합격인원에 못 미치면 40% 넘긴 사람 중 총점순으로 채움", "공인노무사법 시행령 제12조"],
    semusa: ["과목마다 40점 이상, 전 과목 평균 60점 이상", "최소 합격인원에 못 미치면 평균점수순으로 채움", "세무사법 시행령 제8조"],
    gwanse: ["매 과목 40점 이상, 전 과목 평균 60점 이상", "최소합격인원에 못 미치면 40점 넘긴 사람 중 평균순", "관세사법 시행령 제13조"],
    patent: ["선택과목 50점 이상, 필수과목 각 40점 이상·필수 평균 60점 이상", "최소합격인원보다 적으면 필수 평균순", "변리사법 시행령 제4조"],
    gampyeong: ["모든 과목 40점 이상, 전 과목 평균 60점 이상", "최소합격인원에 못 미치면 40점 넘긴 사람 중 평균순", "감정평가법 시행령 제10조"],
    cpa: ["매 과목 배점의 60% 이상(과목 합격은 다음 회 1번 면제)", "최소선발예정인원에 못 미치면 40% 넘긴 사람 중 총점순", "공인회계사법 시행령 제3조"],
    beopmu: ["매 과목 40점 이상인 사람 중 선발예정인원 안에서 총점순(상대평가)", "합격선은 해마다 달라짐", "법무사규칙 제13조"],
    lawyer: ["선택형·논술형 환산 총점으로 결정, 과목별 합격최저점수 미달이면 불합격", "환산비율·최저점수는 시행령 별표 3·4", "변호사시험법 제10조, 시행령 제8조"]
  };

  function load() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
    o.best = o.best || {}; o.box = o.box || {}; o.log = o.log || []; o.draft = o.draft || {}; o.pref = o.pref || {};
    return o;
  }
  function save() {
    if (R.log.length > 600) R.log = R.log.slice(-600);
    try { localStorage.setItem(KEY, JSON.stringify(R)); } catch (e) {}
  }
  function today() { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

  /* ── 채점 ───────────────────────────────────────── */
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[\s·ㆍ,.()\[\]{}「」『』<>《》'"“”‘’\-_:;\/~!?]/g, "");
  }
  function hasWord(nans, w) { var k = norm(w); return k.length > 0 && nans.indexOf(k) >= 0; }
  function words(el) {
    var out = (el.kw || []).slice();
    var syn = el.syn || {};
    Object.keys(syn).forEach(function (k) { out = out.concat(syn[k] || []); });
    return out;
  }
  function judge(it, text) {
    var n = norm(text), got = 0, res = [];
    (it.el || []).forEach(function (el) {
      if (el.cand) {   /* 「N가지 쓰시오」 — 후보 중 맞힌 개수만큼 */
        var hc = el.cand.filter(function (c) { return (c.kw || []).some(function (w) { return hasWord(n, w); }); });
        var k = el.k || el.cand.length, part = Math.min(hc.length, k) / k;
        got += el.p * part;
        res.push({ id: el.id, hit: part >= 1, part: part, words: hc.map(function (c) { return c.n; }) });
        return;
      }
      var must = (el.must || []).every(function (m) { return hasWord(n, m); });
      var hitW = words(el).filter(function (w) { return hasWord(n, w); });
      var hit = must && hitW.length > 0;
      if (hit) got += el.p;
      res.push({ id: el.id, hit: hit, words: hitW });
    });
    return { got: round1(got), res: res };
  }
  function round1(x) { return Math.round(x * 10) / 10; }
  function numOf(s) {
    var t = String(s == null ? "" : s).replace(/[,\s원%]/g, "").replace(/△|▲/g, "-");
    if (/^\(.*\)$/.test(t)) t = "-" + t.slice(1, -1);
    var v = parseFloat(t);
    return isNaN(v) ? null : v;
  }
  function sameNum(a, b) {
    var x = numOf(a), y = numOf(b);
    if (x === null || y === null) return norm(a) === norm(b) && norm(a) !== "";
    if (y === 0) return Math.abs(x) < 1e-9;
    return Math.abs(x - y) / Math.abs(y) <= 0.001;
  }

  /* ── 요소 상자(간격 반복) ───────────────────────── */
  function bkey(it, el) { return it.id + "#" + el.id; }
  function mark(it, el, ok) {
    var k = bkey(it, el), b = R.box[k] || { b: 0, d: 0 };
    b.b = ok ? Math.min(5, b.b + 1) : 0;
    b.d = addDays(BOX_DAYS[b.b]);
    R.box[k] = b;
  }
  function dueItems() {
    var t = today(), seen = {};
    var out = [];
    Object.keys(R.box).forEach(function (k) {
      var b = R.box[k], id = k.split("#")[0];
      if (b.d <= t && !seen[id] && itemById(id)) { seen[id] = 1; out.push(id); }
    });
    return out;
  }
  function itemById(id) { if (!E) return null; for (var i = 0; i < E.items.length; i++) if (E.items[i].id === id) return E.items[i]; return null; }
  function qOf(it) { return (E.qs && E.qs[it.k]) || { t: "", tb: [] }; }
  function subMeta(name) { for (var i = 0; i < (E.subs || []).length; i++) if (E.subs[i].name === name) return E.subs[i]; return { name: name, time: 0, total: 100 }; }
  function minutesFor(it) {
    var m = subMeta(it.s);
    if (!m.time || !it.p) return Math.max(5, Math.round((it.p || 10) * 1.2));
    return Math.max(3, Math.round(m.time * it.p / (m.total || 100)));
  }

  /* ── 시험 고르기·자료 싣기 ──────────────────────── */
  function curCode() {
    var q = new URLSearchParams(location.search).get("e");
    var want = q || R.pref.code || (GB.exam() || {}).id;
    for (var i = 0; i < IDX.length; i++) if (IDX[i].code === want) return want;
    return IDX.length ? IDX[0].code : null;
  }
  function loadExam(code, cb) {
    if (E && E.code === code) return cb();
    var meta = IDX.filter(function (x) { return x.code === code; })[0];
    var s = document.createElement("script");
    s.src = "data2/" + code + ".js?v=" + ((meta && meta.v) || "");
    s.onload = function () { E = window.E2; view = { s: null, u: null, more: 0 }; cb(); };
    s.onerror = function () { app.innerHTML = '<div class="empty">자료를 못 읽었습니다.</div>'; };
    document.body.appendChild(s);
  }

  function route() {
    stopTimer();
    var code = curCode();
    if (!code) { app.innerHTML = '<div class="hd"><h1>2차 답안 훈련</h1></div><div class="empty">2차 기출을 정리하고 있습니다.</div>'; return; }
    loadExam(code, function () {
      var h = new URLSearchParams(location.hash.slice(1));
      if (h.get("q")) return drawItem(h.get("q"), h.get("m") || "recall", h.get("due") === "1");
      if (h.get("mock")) return drawMock(h.get("mock"));
      drawList();
    });
  }
  window.addEventListener("hashchange", route);

  /* ── 목록: 시험·과목·단원 빈도·물음 ─────────────── */
  function drawList() {
    var subs = E.subs.map(function (s) { return s.name; });
    if (!view.s || subs.indexOf(view.s) < 0) view.s = R.pref.s && subs.indexOf(R.pref.s) >= 0 ? R.pref.s : subs[0];
    var items = E.items.filter(function (it) { return it.s === view.s; });
    var withR = E.items.filter(function (it) { return it.el && it.el.length; });
    var due = dueItems();
    var tried = Object.keys(R.best).filter(function (id) { return itemById(id); });
    var avg = tried.length ? Math.round(tried.reduce(function (a, id) { var b = R.best[id], it = itemById(id); return a + (it.p ? b.s / it.p : 0); }, 0) / tried.length * 100) : 0;
    var h = '<div class="hd"><h1>2차 답안 훈련</h1><a href="strategy.html">1차 전략</a></div>';
    h += '<div class="chips" id="ex">' + IDX.map(function (x) { return '<button type="button" data-c="' + x.code + '"' + (x.code === E.code ? ' class="on"' : "") + ">" + esc(x.name) + "</button>"; }).join("") + "</div>";
    var ps = PASS2[E.code];
    if (ps) h += '<div class="pass2"><b>2차 합격 기준</b> ' + esc(ps[0]) + ". " + esc(ps[1]) + '. <span>' + esc(ps[2]) + "</span></div>";
    h += '<div class="today"><h2>' + (due.length ? "오늘 다시 떠올릴 물음 " + due.length + "개" : "오늘 할 것") + "</h2>" +
      "<p>" + (due.length ? "어제까지 놓친 득점 요소가 다시 나올 차례입니다. 물음 하나에 1분." :
        "아래 단원 중 출제가 많은 곳부터 물음을 골라 「쟁점 인출」로 시작하세요. 놓친 요소는 내일부터 여기에 모입니다.") + "</p>" +
      (due.length ? '<a class="btn block" href="#q=' + encodeURIComponent(due[0]) + '&m=recall&due=1">시작</a>' : "") +
      '<div class="stat"><div><b>' + E.items.length.toLocaleString() + "</b><span>기출 물음 (채점표 " + withR.length.toLocaleString() + ")</span></div>" +
      "<div><b>" + tried.length + "</b><span>내가 써 본 물음</span></div><div><b>" + avg + "%</b><span>평균 득점률(최고점)</span></div></div></div>";
    h += '<div class="chips s" id="subs">' + subs.map(function (s) { return '<button type="button" data-s="' + esc(s) + '"' + (s === view.s ? ' class="on"' : "") + ">" + esc(s) + "</button>"; }).join("") + "</div>";
    /* 단원 빈도 = 이 과목 기출 물음 배점 합 */
    var U = {};
    items.forEach(function (it) {
      var u = it.u || "단원 정리 중";
      U[u] = U[u] || { p: 0, n: 0, ys: {} };
      U[u].p += it.p || 0; U[u].n++; U[u].ys[it.y] = 1;
    });
    var us = Object.keys(U).sort(function (a, b) { return U[b].p - U[a].p; });
    /* 자주 나왔는데(3회 이상) 최근 2년 안 나온 단원 — 다음 시험에 나올 차례로 표시 */
    var lastY = items.reduce(function (m, it) { return Math.max(m, it.y); }, 0);
    us.forEach(function (u) { var ys = Object.keys(U[u].ys).map(Number); U[u].due = ys.length >= 3 && Math.max.apply(null, ys) <= lastY - 2; });
    var maxP = us.length ? U[us[0]].p : 1;
    var sm = subMeta(view.s);
    h += '<h3 class="sec">단원별 출제 <small>' + (sm.time ? sm.time + "분 · " : "") + "배점 합 순 · 누르면 그 단원만</small></h3>";
    h += '<div class="units" id="units">' + us.map(function (u) {
      var ys = Object.keys(U[u].ys).sort().reverse();
      return '<button type="button" data-u="' + esc(u) + '"' + (view.u === u ? ' class="on"' : "") + '><span class="bar"><i style="width:' + Math.round(U[u].p / maxP * 100) + '%"></i></span><span class="nm">' + esc(u) + (U[u].due ? ' <span class="pill t-사례">최근 2년 안 나옴</span>' : "") +
        '</span><span class="yr">' + U[u].n + "문 · 최근 " + ys.slice(0, 3).join("·") + "</span></button>";
    }).join("") + "</div>";
    var years = Object.keys(items.reduce(function (o, it) { o[it.y] = 1; return o; }, {})).sort().reverse();
    h += '<h3 class="sec">실제 시간으로 한 회 <small>과목 시간 그대로</small></h3><div class="chips s">' +
      years.map(function (y) { return '<button type="button" data-mock="' + esc(view.s) + "|" + y + '">' + y + "</button>"; }).join("") + "</div>";
    var shown = items.filter(function (it) { return !view.u || (it.u || "단원 정리 중") === view.u; })
      .sort(function (a, b) { return b.y - a.y || a.n - b.n || String(a.sn).localeCompare(String(b.sn)); });
    h += '<h3 class="sec">물음 <small>' + shown.length + "개 · 최근 연도부터</small></h3><div class=\"list\">";
    var lim = 30 + view.more * 30;
    h += shown.slice(0, lim).map(itemCard).join("") + "</div>";
    if (shown.length > lim) h += '<button class="btn ghost block more" id="more" type="button">더 보기 (' + (shown.length - lim) + ")</button>";
    app.innerHTML = h;
    app.querySelectorAll("#ex button").forEach(function (b) { b.onclick = function () { R.pref.code = b.dataset.c; save(); history.replaceState(null, "", "?e=" + b.dataset.c); E = null; route(); }; });
    app.querySelectorAll("#subs button").forEach(function (b) { b.onclick = function () { view.s = b.dataset.s; view.u = null; view.more = 0; R.pref.s = view.s; save(); drawList(); }; });
    app.querySelectorAll("#units button").forEach(function (b) { b.onclick = function () { view.u = view.u === b.dataset.u ? null : b.dataset.u; view.more = 0; drawList(); }; });
    app.querySelectorAll("[data-mock]").forEach(function (b) { b.onclick = function () { location.hash = "mock=" + encodeURIComponent(b.dataset.mock); }; });
    var mo = document.getElementById("more"); if (mo) mo.onclick = function () { view.more++; drawList(); };
  }
  function itemCard(it) {
    var q = qOf(it), b = R.best[it.id];
    var txt = (it.sq || q.t || "").replace(/\s+/g, " ").slice(0, 160);
    return '<a class="item" href="#q=' + encodeURIComponent(it.id) + '&m=' + (it.el && it.el.length ? "recall" : "full") + '"><div class="top"><span>' + it.y + " · " + it.n + "번" + (it.sn ? " " + esc(it.sn) : "") + "</span>" +
      '<span class="pill t-' + esc(it.t) + '">' + esc(it.t || "서술") + "</span><span>" + (it.p ? it.p + "점" : "") + "</span>" +
      (b ? '<span class="best">최고 ' + b.s + "/" + it.p + "</span>" : (it.el && it.el.length ? "" : '<span class="best" style="color:var(--ink-4)">채점표 준비 중</span>')) +
      '</div><div class="q">' + esc(txt) + "</div>" + (it.iss && it.iss.length ? '<div class="iss">' + esc(it.iss.join(" · ")) + "</div>" : "") + "</a>";
  }

  /* ── 문제 화면 ──────────────────────────────────── */
  function tableHtml(rows) {
    if (!rows || !rows.length) return "";
    return '<div class="tbwrap"><table class="tb">' + rows.map(function (r) {
      return "<tr>" + String(r).split("|").map(function (c) { return "<td>" + esc(c.trim()) + "</td>"; }).join("") + "</tr>";
    }).join("") + "</table></div>";
  }
  function imgHtml(q) {
    return (q.img || []).map(function (u) { return '<img class="qimg" src="' + esc(u) + '" alt="문제 그림" loading="lazy">'; }).join("");
  }
  function qHtml(it, foldLong) {
    var q = qOf(it), long = (q.t || "").length > 700 && foldLong;
    return '<div class="qbox"><div class="src"><span>' + esc(E.name) + " " + it.y + " · " + esc(it.s) + " · " + it.n + "번" + (it.sn ? " " + esc(it.sn) : "") + "</span>" +
      '<span class="pill t-' + esc(it.t) + '">' + esc(it.t || "서술") + "</span>" + (it.p ? "<span>" + it.p + "점</span>" : "") + "</div>" +
      '<div class="body" id="qbody"' + (long ? ' style="max-height:260px;overflow:hidden"' : "") + ">" + esc(q.t) + tableHtml(q.tb) + imgHtml(q) + (q.fig && !q.img ? '<p class="hint">원본 시험지에 그림·표가 더 있습니다.</p>' : "") + "</div>" +
      (long ? '<button class="fold" type="button" id="unfold">문제 전체 보기</button>' : "") +
      (it.sq ? '<div class="sub">' + esc(it.sn ? it.sn + " " : "") + esc(it.sq) + "</div>" : "") + "</div>";
  }
  function modeBar(it, m) {
    var has = it.el && it.el.length, calc = it.calc && it.calc.steps && it.calc.steps.length;
    var M = [["recall", "쟁점 인출", has], ["toc", "목차 쓰기", has], ["full", "실전 쓰기", true], ["calc", "계산 단계", calc]];
    return '<div class="modes">' + M.map(function (x) {
      return '<button type="button" data-m="' + x[0] + '"' + (x[0] === m ? ' class="on"' : "") + (x[2] ? "" : " disabled") + ">" + x[1] + "</button>";
    }).join("") + "</div>";
  }
  function siblings(it) {
    return E.items.filter(function (x) { return x.s === it.s && x.y === it.y; }).sort(function (a, b) { return a.n - b.n || String(a.sn).localeCompare(String(b.sn)); });
  }
  function drawItem(id, m, dueMode) {
    var it = itemById(id);
    if (!it) { location.hash = ""; return; }
    if (!(it.el && it.el.length) && (m === "recall" || m === "toc")) m = "full";
    var h = '<div class="hd"><h1 style="font-size:22px">' + esc(it.s) + '</h1><a href="#">목록</a></div>' + qHtml(it, true) + modeBar(it, m) + '<div id="pane"></div>';
    app.innerHTML = h;
    var uf = document.getElementById("unfold");
    if (uf) uf.onclick = function () { document.getElementById("qbody").style.maxHeight = "none"; uf.remove(); };
    app.querySelectorAll(".modes button").forEach(function (b) { b.onclick = function () { if (!b.disabled) location.hash = "q=" + encodeURIComponent(id) + "&m=" + b.dataset.m + (dueMode ? "&due=1" : ""); }; });
    var pane = document.getElementById("pane");
    if (m === "recall") paneRecall(it, pane, dueMode);
    else if (m === "toc") paneWrite(it, pane, false);
    else if (m === "calc") paneCalc(it, pane);
    else paneWrite(it, pane, true);
  }
  function nextLink(it, dueMode) {
    if (dueMode) {
      var d = dueItems().filter(function (x) { return x !== it.id; });
      return d.length ? '<a class="btn" href="#q=' + encodeURIComponent(d[0]) + '&m=recall&due=1">다음 물음 (' + d.length + ")</a>" : '<a class="btn" href="#">오늘 몫 끝 · 목록</a>';
    }
    var sib = siblings(it), i = sib.indexOf(it);
    return i >= 0 && i < sib.length - 1 ? '<a class="btn" href="#q=' + encodeURIComponent(sib[i + 1].id) + '&m=' + (sib[i + 1].el && sib[i + 1].el.length ? "recall" : "full") + '">다음 물음</a>' : '<a class="btn" href="#">목록</a>';
  }
  function elHtml(el, cls, extra) {
    var kw = el.cand ? "다음 중 " + el.k + "개 · " + el.cand.map(function (c) { return c.n; }).join(", ") : (el.kw || []).join(", ");
    return '<div class="el ' + (cls || "") + '" data-id="' + esc(el.id) + '"><div class="h"><b>' + esc(el.n) + "</b><span>" + el.p + "점</span></div>" +
      (kw ? '<div class="kw">핵심어 · ' + esc(kw) + "</div>" : "") + (el.src ? '<div class="gr">근거 · ' + esc(el.src) + (el.ok === false ? " (확인 중)" : "") + "</div>" : "") + (extra || "") + "</div>";
  }
  function modelHtml(it) {
    var h = '<div class="model">';
    if (it.toc && it.toc.length) h += "<h4>목차</h4><p class=\"toc\">" + esc(it.toc.join("\n")) + "</p>";
    if (it.model) h += '<h4 style="margin-top:12px">답안 예시</h4><p class="txt">' + esc(it.model) + "</p>";
    if (it.minus && it.minus.length) h += '<h4 style="margin-top:12px">자주 깎이는 곳</h4><ul class="minus">' + it.minus.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    if (it.memo) h += '<div class="memo">참고 · ' + esc(it.memo) + "</div>";
    h += '<div class="conf">채점표는 법령·판례·기준서 원문으로 만든 학습용입니다(공식 채점 기준 아님). 신뢰도 ' + esc(it.conf || "중") + ".</div></div>";
    return h;
  }

  /* 1) 쟁점 인출 — 요소 이름을 가린 채 떠올리고, 하나씩 열어 스스로 판정 */
  function paneRecall(it, pane, dueMode) {
    var marks = {};
    pane.innerHTML = '<p class="hint">득점 요소 ' + it.el.length + "개 · " + (it.iss || []).length + "쟁점. 머릿속으로 목차를 세운 다음 카드를 하나씩 열어 맞혔는지 고르세요.</p>" +
      '<div class="els">' + it.el.map(function (el) {
        return elHtml(el, "hid", '<div class="acts2"><button type="button" data-v="open">열기</button></div>');
      }).join("") + '</div><div class="score" id="sc" style="display:none"></div>';
    pane.querySelectorAll(".el").forEach(function (box) {
      var el = it.el.filter(function (e) { return e.id === box.dataset.id; })[0];
      box.querySelector("[data-v=open]").onclick = function () {
        box.classList.remove("hid");
        box.querySelector(".acts2").innerHTML = '<button type="button" data-v="1">떠올림</button><button type="button" data-v="0">못 떠올림</button>';
        box.querySelectorAll(".acts2 button").forEach(function (b) {
          b.onclick = function () {
            marks[el.id] = b.dataset.v === "1";
            box.classList.toggle("hit", marks[el.id]); box.classList.toggle("miss", !marks[el.id]);
            box.querySelectorAll(".acts2 button").forEach(function (x) { x.classList.toggle("on", x === b); });
            if (Object.keys(marks).length === it.el.length) finish();
          };
        });
      };
    });
    function finish() {
      var got = 0;
      it.el.forEach(function (el) { mark(it, el, marks[el.id]); if (marks[el.id]) got += el.p; });
      got = round1(got);
      R.log.push({ id: it.id, ts: Date.now(), m: "recall", s: got, p: it.p });
      save();
      var sc = document.getElementById("sc");
      sc.style.display = "";
      sc.innerHTML = '<div class="big">' + got + "<small>/ " + it.p + "점 떠올림</small></div>" +
        '<div class="note">놓친 요소는 내일 다시 나옵니다. 맞힌 요소는 1·2·4·7·15일 간격으로 늘어납니다.</div>' +
        '<div class="srow"><a class="btn ghost" href="#q=' + encodeURIComponent(it.id) + '&m=toc">목차로 써 보기</a>' + nextLink(it, dueMode) + "</div>" + modelHtml(it);
    }
  }

  /* 2) 목차 쓰기 · 3) 실전 쓰기 — 글자 대조로 요소별 점수 */
  function paneWrite(it, pane, full) {
    var has = it.el && it.el.length;
    var min = minutesFor(it);
    var dk = it.id + (full ? "#f" : "#t");
    pane.innerHTML = (full ? '<div class="timer">권장 ' + min + '분 · <b id="tm">0:00</b><button class="btn ghost sm" type="button" id="tgo">시간 재기</button></div>' :
      '<p class="hint">목차와 요소 이름만 짧게 적으세요. 조문 번호·요건·판례 결론·계산 결과처럼 채점자가 찾는 낱말이 들어가야 점수가 납니다.</p>') +
      '<textarea class="ans' + (full ? " long" : "") + '" id="ans" placeholder="' + (full ? "실제 답안처럼 쓰세요" : "Ⅰ. 쟁점\nⅡ. 관련 법리 …") + '"></textarea><div class="count" id="cnt"></div>' +
      '<div class="acts" style="display:flex;gap:8px;margin-top:10px"><button class="btn" type="button" id="go">' + (has ? "채점" : "다 썼음 · 기출 확인") + "</button></div><div id=\"res\"></div>";
    var ta = document.getElementById("ans"), cnt = document.getElementById("cnt");
    ta.value = R.draft[dk] || "";
    function upd() { cnt.textContent = ta.value.replace(/\s/g, "").length.toLocaleString() + "자"; R.draft[dk] = ta.value; }
    ta.oninput = function () { upd(); clearTimeout(ta._s); ta._s = setTimeout(save, 600); };
    upd();
    var t0 = 0;
    if (full) {
      document.getElementById("tgo").onclick = function () {
        if (timerId) { stopTimer(); this.textContent = "다시 재기"; return; }
        t0 = Date.now(); this.textContent = "멈춤";
        var tm = document.getElementById("tm");
        timerId = setInterval(function () {
          var s = Math.floor((Date.now() - t0) / 1000);
          tm.textContent = Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2);
          tm.classList.toggle("over", s > min * 60);
        }, 500);
      };
    }
    document.getElementById("go").onclick = function () {
      var sec = t0 ? Math.round((Date.now() - t0) / 1000) : 0;
      stopTimer();
      var res = document.getElementById("res");
      if (!has) { res.innerHTML = '<p class="hint">이 물음은 채점표를 만드는 중입니다. 지금은 쓴 답안만 저장됩니다.</p>'; save(); return; }
      showResult(it, ta.value, res, full ? "full" : "toc", sec);
    };
  }
  function showResult(it, text, res, mode, sec) {
    var J = judge(it, text), self = {};
    function total() {
      var s = J.got;
      Object.keys(self).forEach(function (k) { if (self[k]) { var i2 = it.el.findIndex(function (e) { return e.id === k; }); s += it.el[i2].p * (1 - (J.res[i2].part || 0)); } });
      return round1(s);
    }
    function draw() {
      var tot = total();
      res.innerHTML = '<div class="score"><div class="big">' + tot + "<small>/ " + it.p + "점</small></div>" +
        '<div class="note">핵심어 대조 점수(공식 점수 아님). 다른 표현으로 쓴 요소는 「썼음」을 누르면 넣어 줍니다 — 따로 표시해 둡니다.' + (sec ? " 걸린 시간 " + Math.round(sec / 60) + "분." : "") + "</div>" +
        '<div class="srow"><button class="btn ghost" type="button" id="again">다시 쓰기</button>' + nextLink(it, false) + "</div></div>" +
        '<div class="els">' + it.el.map(function (el, i) {
          var r = J.res[i], cls = r.hit ? "hit" : self[el.id] ? "self" : "miss", extra0;
          if (!r.hit && r.part > 0) extra0 = '<div class="kw">' + Math.round(r.part * el.k) + "/" + el.k + "개 · " + esc(r.words.join(", ")) + "</div>"; else extra0 = "";
          var extra = r.hit ? '<div class="kw">찾은 낱말 · ' + esc(r.words.join(", ")) + "</div>" : extra0 +
            '<div class="acts2"><button type="button" data-self="' + esc(el.id) + '"' + (self[el.id] ? ' class="on"' : "") + ">썼음(다른 표현)</button></div>";
          return elHtml(el, cls, extra);
        }).join("") + "</div>" + modelHtml(it);
      res.querySelectorAll("[data-self]").forEach(function (b) { b.onclick = function () { self[b.dataset.self] = !self[b.dataset.self]; commit(); draw(); }; });
      document.getElementById("again").onclick = function () { var ta = document.getElementById("ans"); ta.focus(); window.scrollTo(0, ta.offsetTop - 80); };
    }
    var logged = null;
    function commit() {
      var tot = total();
      if (!logged) { logged = { id: it.id, ts: Date.now(), m: mode, s: tot, p: it.p, sec: sec, auto: J.got }; R.log.push(logged); }
      else logged.s = tot;
      var b = R.best[it.id];
      if (!b || tot > b.s) R.best[it.id] = { s: tot, ts: Date.now() };
      it.el.forEach(function (el, i) { mark(it, el, J.res[i].hit || !!self[el.id]); });
      save();
    }
    commit(); draw();
  }

  /* 4) 계산 단계 — 단계마다 값을 넣고, 틀린 단계에서 식을 보여 준다 */
  function paneCalc(it, pane) {
    var st = it.calc.steps;
    pane.innerHTML = '<p class="hint">단계마다 값을 넣으세요. 쉼표·원은 빼도 됩니다. 음수는 - 또는 △.</p><div class="steps">' + st.map(function (s, i) {
      return '<div class="step" id="st' + i + '"><label>' + esc(s.n) + "<small>" + (s.p ? s.p + "점" : "") + '</small></label><input inputmode="decimal" data-i="' + i + '"><div class="fx" style="display:none"></div></div>';
    }).join("") + '</div><div style="margin-top:10px"><button class="btn" type="button" id="go">맞춰 보기</button></div><div id="res"></div>';
    document.getElementById("go").onclick = function () {
      var got = 0, all = true;
      st.forEach(function (s, i) {
        var box = document.getElementById("st" + i), v = box.querySelector("input").value, ok = sameNum(v, s.v);
        box.classList.toggle("ok", ok); box.classList.toggle("ng", !ok);
        var fx = box.querySelector(".fx");
        fx.style.display = ok ? "none" : ""; fx.textContent = (s.f ? s.f + " = " : "") + s.v;
        if (ok) got += s.p || 0; else all = false;
      });
      got = round1(got);
      R.log.push({ id: it.id, ts: Date.now(), m: "calc", s: got, p: it.p });
      var b = R.best[it.id]; if (!b || got > b.s) R.best[it.id] = { s: got, ts: Date.now() };
      save();
      document.getElementById("res").innerHTML = '<div class="score"><div class="big">' + got + "<small>/ " + it.p + "점</small></div>" +
        '<div class="note">' + (all ? "모든 단계 일치." : "틀린 단계의 식을 보고 그 단계부터 다시 넣어 보세요.") + (it.calc.fin ? " 최종 " + esc(it.calc.fin.v) + esc(it.calc.fin.u || "") : "") + '</div><div class="srow">' + nextLink(it, false) + "</div></div>" + modelHtml(it);
    };
  }

  /* ── 실제 시간 한 회 ───────────────────────────── */
  function drawMock(key) {
    var p = key.split("|"), s = p[0], y = +p[1];
    var list = E.items.filter(function (it) { return it.s === s && it.y === y; }).sort(function (a, b) { return a.n - b.n || String(a.sn).localeCompare(String(b.sn)); });
    if (!list.length) { location.hash = ""; return; }
    var m = subMeta(s), lim = (m.time || 90) * 60, t0 = Date.now();
    var dk = "mock#" + key, D = R.draft[dk] || {};
    var lastK = null;
    var h = '<div class="mockbar"><div class="timer">' + esc(s) + " " + y + ' · 남은 시간 <b id="tm"></b></div><button class="btn sm" type="button" id="end" style="margin-left:auto">제출</button></div>';
    list.forEach(function (it) {
      var q = qOf(it);
      if (it.k !== lastK) {
        h += '<div class="qbox mq"><div class="src"><span>' + it.n + "번" + (m.total ? "" : "") + '</span></div><div class="body">' + esc(q.t) + tableHtml(q.tb) + imgHtml(q) + "</div></div>";
        lastK = it.k;
      }
      h += (it.sq ? '<div class="qbox" style="margin-top:6px"><div class="sub" style="margin:0">' + esc((it.sn ? it.sn + " " : "") + it.sq) + (it.p ? " (" + it.p + "점)" : "") + "</div></div>" : "") +
        '<textarea class="ans" data-id="' + esc(it.id) + '" style="margin-top:8px" placeholder="' + it.n + "번" + (it.sn ? " " + esc(it.sn) : "") + ' 답안"></textarea>';
    });
    h += '<div id="rep"></div>';
    app.innerHTML = h;
    app.querySelectorAll("textarea.ans").forEach(function (ta) {
      ta.value = D[ta.dataset.id] || "";
      ta.oninput = function () { D[ta.dataset.id] = ta.value; R.draft[dk] = D; clearTimeout(ta._s); ta._s = setTimeout(save, 800); };
    });
    var tm = document.getElementById("tm");
    function tick() {
      var left = lim - Math.floor((Date.now() - t0) / 1000);
      tm.textContent = (left < 0 ? "-" : "") + Math.floor(Math.abs(left) / 60) + ":" + ("0" + Math.abs(left) % 60).slice(-2);
      tm.classList.toggle("over", left < 0);
    }
    tick(); timerId = setInterval(tick, 1000);
    document.getElementById("end").onclick = function () {
      var sec = Math.round((Date.now() - t0) / 1000);
      stopTimer();
      var rows = [], got = 0, tot = 0, unr = 0;
      list.forEach(function (it) {
        var text = D[it.id] || "";
        tot += it.p || 0;
        if (!(it.el && it.el.length)) { unr++; rows.push([it, null]); return; }
        var J = judge(it, text);
        got += J.got;
        it.el.forEach(function (el, i) { mark(it, el, J.res[i].hit); });
        var b = R.best[it.id]; if (!b || J.got > b.s) R.best[it.id] = { s: J.got, ts: Date.now() };
        rows.push([it, J]);
      });
      R.log.push({ id: "mock#" + key, ts: Date.now(), m: "mock", s: round1(got), p: tot, sec: sec });
      save();
      document.getElementById("rep").innerHTML = '<div class="score"><div class="big">' + round1(got) + "<small>/ " + tot + "점</small></div>" +
        '<div class="note">걸린 시간 ' + Math.round(sec / 60) + "분 / " + (m.time || 90) + "분. 핵심어 대조 점수(공식 점수 아님)." + (unr ? " 채점표 준비 중인 물음 " + unr + "개는 빠졌습니다." : "") + "</div>" +
        '<table class="rep"><tr><th>물음</th><th>점수</th><th>놓친 요소</th></tr>' + rows.map(function (r) {
          var it = r[0], J = r[1];
          var miss = J ? it.el.filter(function (e, i) { return !J.res[i].hit; }).map(function (e) { return e.n; }) : [];
          return '<tr><td><a href="#q=' + encodeURIComponent(it.id) + '&m=full">' + it.n + "번" + (it.sn ? " " + esc(it.sn) : "") + "</a></td><td>" + (J ? J.got + "/" + it.p : "—") +
            '</td><td style="text-align:left;font-size:13px">' + esc(miss.slice(0, 4).join(", ")) + (miss.length > 4 ? " 외 " + (miss.length - 4) : "") + "</td></tr>";
        }).join("") + "</table><div class=\"srow\"><a class=\"btn\" href=\"#\">목록</a></div></div>";
      document.getElementById("rep").scrollIntoView({ behavior: "smooth" });
    };
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  /* 검사기가 부를 수 있게 — 채점 함수만 */
  window.E2JUDGE = { judge: judge, norm: norm, sameNum: sameNum };
  route();
})();
