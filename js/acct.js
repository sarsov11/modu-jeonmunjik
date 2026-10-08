/* ═══════════════════════════════════════════════════════════
   모두의 전문직 — 계정 훈련 화면 (2026-10-08)
   자리(분류) · 차대 · 재무제표 조립 · 분개 · 짝 · 현황.
   기록은 localStorage `mp.acct.v1` — 상자(0~5) 반복: 맞히면 한 칸 위, 틀리면 0으로.
   상자가 낮을수록 자주 나온다.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var D = window.ACCT, SECS = D.SECS, KEY = "mp.acct.v1";
  if (window.GB) GB.mountNav("acct.html");
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function won(n) { return (n < 0 ? "(" : "") + Math.abs(n).toLocaleString("ko-KR") + (n < 0 ? ")" : ""); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  /* ── 기록 ── */
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
  if (!S || typeof S !== "object") S = {};
  ["a", "s", "j", "p"].forEach(function (k) { if (!S[k]) S[k] = {}; });
  if (!S.opt) S.opt = {};
  if (S.day !== today()) { S.day = today(); S.today = 0; S.todayOk = 0; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function rec(bucket, id) { return S[bucket][id] || { b: 0, n: 0, w: 0 }; }
  function grade(bucket, id, ok) {
    var r = rec(bucket, id);
    r.n++; if (ok) r.b = Math.min(5, r.b + 1); else { r.b = 0; r.w++; }
    S[bucket][id] = r; S.today++; if (ok) S.todayOk++; save();
  }
  var recent = {};
  function pick(bucket, items) {
    var last = recent[bucket] || [], cand = items.filter(function (it) { return last.indexOf(it.id) < 0; });
    if (!cand.length) cand = items;
    var tot = 0, w = cand.map(function (it) {
      var r = S[bucket][it.id], x = !r ? 3 : r.b >= 5 ? 0.25 : 6 - r.b;
      tot += x; return x;
    });
    var t = Math.random() * tot, i = 0;
    for (; i < cand.length - 1; i++) { t -= w[i]; if (t <= 0) break; }
    last.push(cand[i].id); if (last.length > Math.min(6, items.length - 1)) last.shift();
    recent[bucket] = last;
    return cand[i];
  }
  function meta(label) {
    return '<div class="meta"><span>' + label + '</span><span>오늘 <b class="num">' + S.today + "</b>개 · 정답 <b class=\"num\">" +
      (S.today ? Math.round(S.todayOk / S.today * 100) : 0) + "</b>%</span></div>";
  }
  function secNames(a) { return a.sec.map(function (k) { return SECS[k].n; }).join(" / "); }
  function fbAcct(a, ok, extra) {
    return '<div class="fb"><div class="v ' + (ok ? "ok" : "no") + '">' + (ok ? "맞음" : "틀림") + " — " + esc(a.n) + "</div>" +
      '<div class="kv"><span>' + esc(a.g) + "</span><span>" + esc(secNames(a)) + "</span>" +
      (a.g !== "임시" ? "<span>정상잔액 " + a.side + "변</span>" : "") + (a.contra ? "<span>" + esc(a.contra) + (a.contra.indexOf("가산") >= 0 ? "" : " 차감") + "</span>" : "") + "</div>" +
      esc(a.tip) + (extra || "") + "</div>";
  }

  /* ── 탭 ── */
  var MODES = [["sort", "계정 자리"], ["side", "차변·대변"], ["build", "재무제표 조립"], ["jour", "분개"], ["pair", "헷갈리는 짝"], ["stat", "현황"]];
  var mode = new URLSearchParams(location.search).get("m") || S.mode || "sort";
  if (!MODES.some(function (m) { return m[0] === mode; })) mode = "sort";
  function tabs() {
    $("tabs").innerHTML = MODES.map(function (m) { return '<button type="button" data-m="' + m[0] + '"' + (m[0] === mode ? ' class="on"' : "") + ">" + m[1] + "</button>"; }).join("");
    $("tabs").querySelectorAll("button").forEach(function (b) { b.onclick = function () { mode = b.dataset.m; S.mode = mode; save(); tabs(); run(); }; });
  }
  function run() { ({ sort: sortMode, side: sideMode, build: buildMode, jour: jourMode, pair: pairMode, stat: statMode })[mode](); window.scrollTo(0, 0); }

  /* ── 1. 계정 자리 ── 대분류 → 세부 칸 (→ 차·대) */
  var GROUPS = ["자산", "부채", "자본", "수익", "비용", "임시"];
  function sortMode() {
    var a = pick("a", D.ACCTS), step = 1, gOk = null;
    function secsOf(g) { return Object.keys(SECS).filter(function (k) { return SECS[k].g === g; }); }
    function draw() {
      var h = meta("계정이 들어갈 자리") + '<div class="q"><div class="nm">' + esc(a.n) + '</div><div class="sub">' +
        (step === 1 ? "어디에 속하나" : step === 2 ? esc(a.g) + " 중 어느 칸" : "정상잔액은") + "</div></div>";
      if (step === 1) h += '<div class="grid g3">' + GROUPS.map(function (g) { return '<button type="button" data-v="' + g + '">' + (g === "임시" ? "임시계정<small>재무제표에 없음</small>" : g) + "</button>"; }).join("") + "</div>";
      if (step === 2) h += '<div class="crumb">' + esc(a.g) + "</div>" + '<div class="grid">' + secsOf(a.g).map(function (k) {
        var n = SECS[k].n.split(" · "); return '<button type="button" data-v="' + k + '">' + esc(n[1] || n[0]) + (n[1] ? "<small>" + esc(n[0]) + "</small>" : "") + "</button>";
      }).join("") + "</div>";
      if (step === 3) h += '<div class="grid"><button type="button" data-v="차">차변</button><button type="button" data-v="대">대변</button></div>';
      h += '<label class="opt"><input type="checkbox" id="optside"' + (S.opt.side ? " checked" : "") + "> 정상잔액(차·대)까지 묻기</label>";
      $("main").innerHTML = h;
      $("optside").onchange = function () { S.opt.side = this.checked; save(); };
      $("main").querySelectorAll(".grid button").forEach(function (b) { b.onclick = function () { choose(b); }; });
    }
    function finish(ok, picked) {
      grade("a", a.id, ok);
      $("main").querySelectorAll(".grid button").forEach(function (b) {
        b.disabled = true;
        var right = step === 1 ? b.dataset.v === a.g : step === 2 ? a.sec.indexOf(b.dataset.v) >= 0 : b.dataset.v === a.side;
        if (right) b.classList.add("ok"); else if (b === picked) b.classList.add("no");
      });
      $("main").insertAdjacentHTML("beforeend", fbAcct(a, ok) + '<button class="btn block next" id="nx">다음</button>');
      $("nx").onclick = sortMode; $("nx").focus();
    }
    function choose(b) {
      var v = b.dataset.v;
      if (step === 1) {
        if (v !== a.g) return finish(false, b);
        if (a.g === "임시") return finish(true, b);
        step = 2; return draw();
      }
      if (step === 2) {
        if (a.sec.indexOf(v) < 0) return finish(false, b);
        if (S.opt.side) { step = 3; return draw(); }
        return finish(true, b);
      }
      finish(v === a.side, b);
    }
    draw();
  }

  /* ── 2. 차변·대변 ── 정상잔액. 차감계정이 주로 걸린다 */
  function sideMode() {
    var list = D.ACCTS.filter(function (a) { return a.g !== "임시"; });
    var a = pick("s", list);
    $("main").innerHTML = meta("정상잔액이 어느 쪽인가") + '<div class="q"><div class="nm">' + esc(a.n) + '</div><div class="sub">' + esc(a.g) + "</div></div>" +
      '<div class="grid"><button type="button" data-v="차">차변</button><button type="button" data-v="대">대변</button></div>';
    $("main").querySelectorAll(".grid button").forEach(function (b) {
      b.onclick = function () {
        var ok = b.dataset.v === a.side;
        grade("s", a.id, ok);
        $("main").querySelectorAll(".grid button").forEach(function (x) { x.disabled = true; if (x.dataset.v === a.side) x.classList.add("ok"); else if (x === b) x.classList.add("no"); });
        $("main").insertAdjacentHTML("beforeend", fbAcct(a, ok) + '<button class="btn block next" id="nx">다음</button>');
        $("nx").onclick = sideMode; $("nx").focus();
      };
    });
  }

  /* ── 3. 재무제표 조립 ── */
  var PARENT = { "대손충당금": "매출채권", "재고자산평가충당금": "상품", "감가상각누계액": "건물", "손상차손누계액": "기계장치",
    "정부보조금(자산차감)": "기계장치", "사채할인발행차금": "사채", "사채할증발행차금": "사채", "사외적립자산": "확정급여채무" };
  function rnd(lo, hi, step) { step = step || 100000; return Math.round((lo + Math.random() * (hi - lo)) / step) * step; }
  function sign(a) {   /* 자기 대분류 합계에 더하는 부호 */
    var debitNature = a.g === "자산" || a.g === "비용";
    return (a.side === "차") === debitNature ? 1 : -1;
  }
  function makeBS() {
    var bs = D.ACCTS.filter(function (a) { return SECS[a.sec[0]].st === "BS" && a.n !== "미처리결손금" && a.n !== "미처분이익잉여금" && a.n !== "현금" && a.n !== "보통주자본금"; });
    var names = ["현금", "보통주자본금"];
    shuffle(bs).slice(0, 9).forEach(function (a) {
      if (names.indexOf(a.n) < 0) names.push(a.n);
      var p = PARENT[a.n]; if (p && names.indexOf(p) < 0) names.push(p);
    });
    if (names.indexOf("사채할인발행차금") >= 0 && names.indexOf("사채할증발행차금") >= 0) names.splice(names.indexOf("사채할증발행차금"), 1);
    var amt = {};
    names.forEach(function (n) { if (!PARENT[n]) amt[n] = rnd(1000000, 30000000); });
    names.forEach(function (n) { if (PARENT[n]) amt[n] = Math.round(amt[PARENT[n]] * (n === "사외적립자산" ? 0.6 : 0.05 + Math.random() * 0.3) / 10000) * 10000; });
    function tot(g) { return names.reduce(function (s, n) { var a = D.BY[n]; return a.g === g ? s + sign(a) * amt[n] : s; }, 0); }
    var plug = tot("자산") - tot("부채") - tot("자본");
    if (plug < 2000000) { amt["현금"] += 2000000 - plug + rnd(0, 5000000); plug = tot("자산") - tot("부채") - tot("자본"); }
    names.push("미처분이익잉여금"); amt["미처분이익잉여금"] = plug;
    return { kind: "BS", names: shuffle(names), amt: amt };
  }
  function makePL() {
    var pl = D.ACCTS.filter(function (a) { return SECS[a.sec[0]].st === "PL" && ["매출", "매출원가", "법인세비용"].indexOf(a.n) < 0; });
    var names = ["매출", "매출원가", "법인세비용"].concat(shuffle(pl).slice(0, 8).map(function (a) { return a.n; }));
    var amt = { "매출": rnd(80000000, 150000000, 1000000) };
    amt["매출원가"] = Math.round(amt["매출"] * (0.5 + Math.random() * 0.15) / 100000) * 100000;
    names.forEach(function (n) { if (!amt[n] && n !== "법인세비용") amt[n] = rnd(300000, 6000000); });
    var pre = names.reduce(function (s, n) { var a = D.BY[n]; return n === "법인세비용" ? s : s + (a.g === "수익" ? 1 : -1) * amt[n]; }, 0);
    amt["법인세비용"] = Math.max(100000, Math.round(pre * 0.2 / 10000) * 10000);
    return { kind: "PL", names: shuffle(names), amt: amt };
  }
  var BUILD = null;
  function buildMode() {
    var kind = S.buildKind || "BS";
    BUILD = kind === "BS" ? makeBS() : makePL();
    var place = {}, sel = null, checked = false;
    var LEFT = ["A1", "A2", "A3", "A4", "A5", "A6"], RIGHT = ["L1", "L2", "E1", "E2", "E3", "E4", "E5"], PLS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
    function chip(n, cls) { return '<button type="button" data-n="' + esc(n) + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + esc(n) + " <span class=\"num\" style=\"font-weight:700;color:var(--ink-4)\">" + won(BUILD.amt[n]) + "</span></button>"; }
    function slot(k) {
      var inside = BUILD.names.filter(function (n) { return place[n] === k; });
      return '<div class="slot' + (sel && !checked ? " hot" : "") + '" data-k="' + k + '"><div class="sn">' + esc(SECS[k].n) + '</div><div class="in">' +
        inside.map(function (n) { return chip(n, checked ? (D.BY[n].sec.indexOf(k) >= 0 ? "ok" : "no") : ""); }).join("") + "</div></div>";
    }
    function draw() {
      var left = BUILD.names.filter(function (n) { return !place[n]; });
      var h = '<div class="tabs" style="padding-top:4px">' + [["BS", "재무상태표"], ["PL", "포괄손익계산서"]].map(function (x) {
        return '<button type="button" data-k="' + x[0] + '"' + (x[0] === kind ? ' class="on"' : "") + ">" + x[1] + "</button>"; }).join("") + "</div>" +
        meta(kind === "BS" ? "계정을 누르고 들어갈 칸을 누른다. 놓은 계정을 누르면 다시 빠진다." : "손익 계정을 칸에 놓으면 이익 단계가 계산된다.") +
        '<div class="tray" id="tray">' + (left.length ? left.map(function (n) { return chip(n, n === sel ? "sel" : ""); }).join("") : '<span class="empty">다 놓았다. 채점을 누른다.</span>') + "</div>";
      if (kind === "BS") h += '<div class="fs"><div><h3>자산</h3>' + LEFT.map(slot).join("") + "</div><div><h3>부채</h3>" + RIGHT.slice(0, 2).map(slot).join("") + "<h3 style=\"margin-top:10px\">자본</h3>" + RIGHT.slice(2).map(slot).join("") + "</div></div>";
      else h += '<div class="fs one"><div><h3>포괄손익계산서</h3>' + PLS.map(slot).join("") + "</div></div>";
      h += checked ? statement() + '<button class="btn block next" id="nx">새 문제</button>' :
        '<button class="btn block next" id="ck"' + (left.length ? " disabled" : "") + ">채점</button>";
      if (sel && !checked) {
        var ks = kind === "BS" ? LEFT.concat(RIGHT) : PLS;
        h += '<div class="picker"><div class="in"><div class="pt"><span>' + esc(sel) + ' →</span><button type="button" id="pc">취소</button></div><div class="pg">' +
          ks.map(function (k) { return '<button type="button" class="' + k[0] + '" data-k="' + k + '">' + esc(SECS[k].n.split(" · ").pop()) + "</button>"; }).join("") + "</div></div></div>";
      }
      $("main").innerHTML = h;
      if ($("pc")) $("pc").onclick = function () { sel = null; draw(); };
      $("main").querySelectorAll(".picker .pg button").forEach(function (b) { b.onclick = function () { place[sel] = b.dataset.k; sel = null; draw(); }; });
      $("main").querySelectorAll(".tabs button").forEach(function (b) { b.onclick = function () { S.buildKind = b.dataset.k; save(); buildMode(); }; });
      $("tray").querySelectorAll("button").forEach(function (b) { b.onclick = function () { sel = sel === b.dataset.n ? null : b.dataset.n; draw(); }; });
      $("main").querySelectorAll(".slot").forEach(function (s) {
        s.onclick = function (e) {
          if (checked) return;
          var hit = e.target.closest("button");
          if (hit && hit.dataset.n) { delete place[hit.dataset.n]; sel = hit.dataset.n; return draw(); }
          if (sel) { place[sel] = s.dataset.k; sel = null; draw(); }
        };
      });
      if ($("ck")) $("ck").onclick = function () {
        checked = true;
        var wrong = 0;
        BUILD.names.forEach(function (n) { var a = D.BY[n], ok = a.sec.indexOf(place[n]) >= 0; if (!ok) wrong++; grade("a", a.id, ok); });
        draw();
        var v = document.createElement("div");
        v.className = "fb"; v.innerHTML = '<div class="v ' + (wrong ? "no" : "ok") + '">' + (wrong ? "틀린 자리 " + wrong + "개" : "전부 맞음") + "</div>" +
          BUILD.names.filter(function (n) { return D.BY[n].sec.indexOf(place[n]) < 0; }).map(function (n) {
            var a = D.BY[n]; return "<p style=\"margin:6px 0\"><b>" + esc(n) + "</b> → " + esc(secNames(a)) + ". " + esc(a.tip) + "</p>"; }).join("");
        $("main").insertBefore(v, $("nx"));
      };
      if ($("nx")) $("nx").onclick = buildMode;
    }
    /* 맞는 자리 기준으로 재무제표를 그린다 — 차감계정은 본계정 아래 들여 쓴다 */
    function statement() {
      var amt = BUILD.amt;
      function home(n) { var a = D.BY[n]; return a.sec.indexOf(place[n]) >= 0 ? place[n] : a.sec[0]; }
      function lines(k) {
        var out = [], ns = BUILD.names.filter(function (n) { return home(n) === k && !PARENT[n]; });
        ns.forEach(function (n) {
          out.push('<div class="l s"><span>' + esc(n) + '</span><span class="num">' + won(sign(D.BY[n]) * amt[n]) + "</span></div>");
          BUILD.names.filter(function (c) { return PARENT[c] === n; }).forEach(function (c) {
            out.push('<div class="l c"><span>' + esc(c) + '</span><span class="num">' + won(sign(D.BY[c]) * amt[c]) + "</span></div>");
          });
        });
        BUILD.names.filter(function (c) { return PARENT[c] && home(c) === k && BUILD.names.indexOf(PARENT[c]) < 0; }).forEach(function (c) {
          out.push('<div class="l c"><span>' + esc(c) + '</span><span class="num">' + won(sign(D.BY[c]) * amt[c]) + "</span></div>");
        });
        return out.join("");
      }
      function sum(ks) { return BUILD.names.reduce(function (s, n) { return ks.indexOf(home(n)) >= 0 ? s + sign(D.BY[n]) * amt[n] : s; }, 0); }
      function block(title, ks) {
        return ks.filter(function (k) { return BUILD.names.some(function (n) { return home(n) === k; }); }).map(function (k) {
          return '<div class="l h"><span>' + esc(SECS[k].n.split(" · ").pop()) + '</span><span class="num">' + won(sum([k])) + "</span></div>" + lines(k);
        }).join("");
      }
      if (BUILD.kind === "BS") {
        var A = sum(LEFT), L = sum(["L1", "L2"]), E = sum(RIGHT.slice(2));
        return '<div class="stmt"><h4>재무상태표</h4><div class="two"><div>' +
          '<div class="l t" style="margin-top:0;border-top:0"><span>유동자산</span><span class="num">' + won(sum(["A1", "A2"])) + "</span></div>" + block("", ["A1", "A2"]) +
          '<div class="l t"><span>비유동자산</span><span class="num">' + won(sum(["A3", "A4", "A5", "A6"])) + "</span></div>" + block("", ["A3", "A4", "A5", "A6"]) +
          '<div class="l t"><span>자산 총계</span><span class="num">' + won(A) + '</span></div></div><div>' + block("부채", ["L1", "L2"]) +
          '<div class="l t"><span>부채 총계</span><span class="num">' + won(L) + "</span></div>" + block("자본", RIGHT.slice(2)) +
          '<div class="l t"><span>자본 총계</span><span class="num">' + won(E) + '</span></div><div class="l t"><span>부채와 자본 총계</span><span class="num">' + won(L + E) + "</span></div></div></div></div>";
      }
      function s(k) { return BUILD.names.reduce(function (t, n) { return home(n) === k ? t + amt[n] : t; }, 0); }
      function list(k) { return BUILD.names.filter(function (n) { return home(n) === k; }).map(function (n) { return '<div class="l c"><span>' + esc(n) + '</span><span class="num">' + won(amt[n]) + "</span></div>"; }).join(""); }
      var gp = s("P1") - s("P2"), op = gp - s("P3"), pre = op + s("P4") - s("P5") + s("P6") - s("P7"), net = pre - s("P8");
      function L1(t, v, cls) { return '<div class="l ' + (cls || "s") + '"><span>' + t + '</span><span class="num">' + won(v) + "</span></div>"; }
      return '<div class="stmt"><h4>포괄손익계산서</h4>' + L1("매출액", s("P1")) + list("P1") + L1("매출원가", s("P2")) + list("P2") + L1("매출총이익", gp, "h") +
        L1("판매비와관리비", s("P3")) + list("P3") + L1("영업이익", op, "h") + L1("기타수익", s("P4")) + list("P4") + L1("기타비용", s("P5")) + list("P5") +
        L1("금융수익", s("P6")) + list("P6") + L1("금융원가", s("P7")) + list("P7") + L1("법인세비용차감전순이익", pre, "h") + L1("법인세비용", s("P8")) +
        L1("당기순이익", net, "t") + "</div>";
    }
    draw();
  }

  /* ── 4. 분개 ── 계정을 눌러 차변(검정)·대변(빨강)으로 */
  function jourMode() {
    var j = pick("j", D.JOURNAL), st = {}, done = false;
    var ans = {}; j.d.forEach(function (x) { ans[x[0]] = "d"; }); j.c.forEach(function (x) { ans[x[0]] = "c"; });
    var used = Object.keys(ans).concat(j.x), extra = shuffle(D.ACCTS.filter(function (a) { return used.indexOf(a.n) < 0 && a.g !== "임시"; })).slice(0, 2).map(function (a) { return a.n; });
    var pool = shuffle(used.concat(extra));
    function draw() {
      var h = meta("거래를 읽고 계정을 차변·대변에 놓는다") + '<div class="q txt"><div class="nm">' + esc(j.q) + "</div></div>" +
        '<div class="legend"><span><i style="background:var(--ink)"></i>한 번 누르면 차변</span><span><i style="background:var(--cta)"></i>두 번 누르면 대변</span></div>' +
        '<div class="pool">' + pool.map(function (n) {
          var miss = done && (st[n] || "") !== (ans[n] || "");
          return '<button type="button" data-n="' + esc(n) + '"' + (st[n] ? ' data-s="' + st[n] + '"' : "") + (miss ? ' class="miss"' : "") + ">" + esc(n) + "</button>"; }).join("") + "</div>";
      if (!done) h += '<button class="btn block next" id="ck">채점</button>';
      $("main").innerHTML = h;
      if (!done) {
        $("main").querySelectorAll(".pool button").forEach(function (b) {
          b.onclick = function () { var n = b.dataset.n; st[n] = !st[n] ? "d" : st[n] === "d" ? "c" : ""; if (!st[n]) delete st[n]; draw(); };
        });
        $("ck").onclick = function () {
          done = true;
          var ok = pool.every(function (n) { return (st[n] || "") === (ans[n] || ""); });
          grade("j", j.id, ok);
          draw();
          function side(xs) { return xs.map(function (x) { return "<p><b>" + esc(x[0]) + '</b><span class="num">' + won(x[1]) + "</span></p>"; }).join(""); }
          $("main").insertAdjacentHTML("beforeend", '<div class="fb"><div class="v ' + (ok ? "ok" : "no") + '">' + (ok ? "맞음" : "틀림") + "</div>" +
            '<div class="tf"><div><h4>차변</h4>' + side(j.d) + "</div><div><h4>대변</h4>" + side(j.c) + "</div></div>" +
            '<p style="margin:10px 0 0">' + esc(j.why) + "</p>" +
            j.x.filter(function (n) { return D.BY[n]; }).map(function (n) { return '<p style="margin:6px 0 0;color:var(--ink-3)"><b>' + esc(n) + "</b>: " + esc(D.BY[n].tip) + "</p>"; }).join("") +
            '</div><button class="btn block next" id="nx">다음 거래</button>');
          $("nx").onclick = jourMode; $("nx").focus();
        };
      }
    }
    draw();
  }

  /* ── 5. 헷갈리는 짝 ── */
  function pairMode() {
    var p = pick("p", D.PAIRS), opts = shuffle([p.a, p.b]);
    $("main").innerHTML = meta("둘 중 맞는 쪽") + '<div class="q txt"><div class="nm">' + esc(p.q) + "</div></div>" +
      '<div class="grid">' + opts.map(function (o) { return '<button type="button" data-v="' + esc(o) + '">' + esc(o) + "</button>"; }).join("") + "</div>";
    $("main").querySelectorAll(".grid button").forEach(function (b) {
      b.onclick = function () {
        var ok = b.dataset.v === p.a;
        grade("p", p.id, ok);
        $("main").querySelectorAll(".grid button").forEach(function (x) { x.disabled = true; if (x.dataset.v === p.a) x.classList.add("ok"); else if (x === b) x.classList.add("no"); });
        $("main").insertAdjacentHTML("beforeend", '<div class="fb"><div class="v ' + (ok ? "ok" : "no") + '">' + (ok ? "맞음" : "틀림") + " — " + esc(p.a) + "</div>" + esc(p.why) +
          '</div><button class="btn block next" id="nx">다음</button>');
        $("nx").onclick = pairMode; $("nx").focus();
      };
    });
  }

  /* ── 6. 현황 ── 칸마다 상자 3 이상인 계정 비율 */
  function statMode() {
    var h = '<div class="meta"><span>칸별 숙달(세 번 연달아 맞힌 계정 비율)</span></div><div class="mt">';
    Object.keys(SECS).forEach(function (k) {
      var as = D.ACCTS.filter(function (a) { return a.sec[0] === k; }); if (!as.length) return;
      var m = as.filter(function (a) { return rec("a", a.id).b >= 3; }).length, pct = Math.round(m / as.length * 100);
      h += '<div class="r"><b>' + esc(SECS[k].n.split(" · ").pop()) + '</b><div class="bar2"><i style="width:' + pct + '%"></i></div><span class="num">' + m + "/" + as.length + "</span></div>";
    });
    h += "</div>";
    var weak = D.ACCTS.filter(function (a) { return rec("a", a.id).w + rec("s", a.id).w > 0; })
      .sort(function (x, y) { return (rec("a", y.id).w + rec("s", y.id).w) - (rec("a", x.id).w + rec("s", x.id).w) || rec("a", x.id).b - rec("a", y.id).b; }).slice(0, 20);
    h += '<div class="meta" style="margin-top:22px"><span>자주 틀린 계정</span></div><div class="weak">' +
      (weak.length ? weak.map(function (a) { return "<span>" + esc(a.n) + " " + (rec("a", a.id).w + rec("s", a.id).w) + "</span>"; }).join("") : '<span style="background:var(--surface-2);color:var(--ink-3)">아직 없음</span>') + "</div>";
    function cnt(b, items) { var n = items.filter(function (it) { return rec(b, it.id).b >= 3; }).length; return n + " / " + items.length; }
    h += '<div class="list" style="margin-top:22px">' +
      '<div class="row"><span class="t"><b>분개</b><span>세 번 연달아 맞힌 거래</span></span><span class="num">' + cnt("j", D.JOURNAL) + "</span></div>" +
      '<div class="row"><span class="t"><b>헷갈리는 짝</b><span>세 번 연달아 맞힌 짝</span></span><span class="num">' + cnt("p", D.PAIRS) + "</span></div>" +
      '<div class="row"><span class="t"><b>차변·대변</b><span>세 번 연달아 맞힌 계정</span></span><span class="num">' + cnt("s", D.ACCTS.filter(function (a) { return a.g !== "임시"; })) + "</span></div></div>" +
      '<button class="btn ghost block next" id="rs" style="margin-top:22px">계정 훈련 기록 전부 삭제 · 복구 불가</button>';
    $("main").innerHTML = h;
    $("rs").onclick = function () {
      if (!confirm("계정 훈련 기록 전부 삭제 · 복구 불가")) return;
      S = { a: {}, s: {}, j: {}, p: {}, opt: S.opt, day: today(), today: 0, todayOk: 0 }; save(); statMode();
    };
  }

  tabs(); run();
})();
