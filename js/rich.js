/* ═══════════════════════════════════════════════════════════
   모두의 전문직 — 기출 글 표·수식 그리기 (2026-10-08, 수식 해석기 1013)
   수집기가 남긴 두 표기를 HTML 로 바꾼다.
   ① 표: 줄마다 「 | 」 로 칸을 나눈 연속 줄, 또는 { … | … / … } (중첩 표 — 「 / 」 가 행 구분)
   ② 한글 수식: { … } 안의 한글(HWP) 수식 스크립트 — over·sqrt·_{}·^{}·LEFT/RIGHT·bar·cases·그리스 문자
      정규식 치환 대신 묶음을 나무로 읽어 그린다(1013 — 중첩 {{bar{X}}}, 지수 안 분수 K^{1 over 3},
      분수 안 띄어쓰기 { {1} over {sqrt {2}} v} 가 깨져 글자로 보였다).
   ③ 여러 줄에 걸친 { … } (자료 줄바꿈이 묶음 안에 들어간 것)은 한 묶음으로 읽고 줄은 칸 안 줄바꿈으로.
   RICH(글) 은 글을 먼저 이스케이프한 뒤 표시만 덧씌운다 — 원문에 HTML 이 들어가지 않는다.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var GREEK = { alpha: "α", beta: "β", gamma: "γ", delta: "δ", DELTA: "Δ", Delta: "Δ", epsilon: "ε", varepsilon: "ε", theta: "θ", lambda: "λ",
    mu: "μ", pi: "π", rho: "ρ", sigma: "σ", SIGMA: "Σ", Sigma: "Σ", tau: "τ", phi: "φ", omega: "ω", eta: "η", infty: "∞", partial: "∂",
    ALPHA: "Α", BETA: "Β", GAMMA: "Γ", Gamma: "Γ", THETA: "Θ", LAMBDA: "Λ", PI: "Π", PHI: "Φ", OMEGA: "Ω", Omega: "Ω", xi: "ξ", kappa: "κ", nu: "ν", chi: "χ", psi: "ψ", zeta: "ζ", INF: "∞", inf: "∞" };
  var OPS = { TIMES: "×", times: "×", cdot: "·", CDOT: "·", DIV: "÷", div: "÷", le: "≤", leq: "≤", LEQ: "≤", ge: "≥", geq: "≥", GEQ: "≥", neq: "≠", NEQ: "≠", NOT: "¬",
    sum: "Σ", SUM: "Σ", SMALLSUM: "Σ", prod: "Π", PROD: "Π", prime: "′", sim: "∼", SIM: "∼", approx: "≈", APPROX: "≈", rarrow: "→", RARROW: "→", rightarrow: "→",
    larrow: "←", LARROW: "←", LRARROW: "⇔", lrarrow: "↔", int: "∫", INT: "∫", "PLUSMINUS": "±", pm: "±", DEG: "°", deg: "°", CIRC: "°", circ: "∘", therefore: "∴", because: "∵",
    in: "∈", subset: "⊂", cup: "∪", cap: "∩", lim: "lim", Lim: "lim", ln: "ln", log: "log", exp: "exp", max: "max", min: "min", sin: "sin", cos: "cos", tan: "tan" };
  /* 낱말 뒤 묶음 하나를 받는 명령 */
  var PRE = {
    sqrt: function (a) { return "√<span class=\"ov\">" + a + "</span>"; },
    bar: function (a) { return "<span class=\"ov\">" + a + "</span>"; },
    overline: function (a) { return "<span class=\"ov\">" + a + "</span>"; },
    under: function (a) { return "<u>" + a + "</u>"; }, underline: function (a) { return "<u>" + a + "</u>"; },
    hat: function (a) { return a + "̂"; }, vec: function (a) { return a + "⃗"; }, dot: function (a) { return a + "̇"; },
    ddot: function (a) { return a + "̈"; }, tilde: function (a) { return a + "̃"; }, acute: function (a) { return a; }, grave: function (a) { return a; },
    rm: function (a) { return a; }, it: function (a) { return a; }, bold: function (a) { return "<b>" + a + "</b>"; }
  };
  var BLOCK = { cases: 1, eqalign: 1, pile: 1, lpile: 1, rpile: 1, matrix: 1, pmatrix: 1, bmatrix: 1, dmatrix: 1 };
  var MARK = /[\^_]|\b(?:over|atop|sqrt|bar|overline|hat|vec|LEFT|RIGHT|left|right|cases|eqalign|pile|matrix|TIMES|times|cdot|LEQ|GEQ|leq|geq|alpha|beta|gamma|delta|DELTA|theta|lambda|sigma|pi|rho|mu|SMALLSUM|sum|int|rm)\b/;

  /* 짝 맞는 { } 의 끝 위치 */
  function close(s, i) { var d = 0; for (var j = i; j < s.length; j++) { if (s[j] === "{") d++; else if (s[j] === "}") { d--; if (!d) return j; } } return -1; }

  /* 수식 글 → 토큰 → 묶음 나무 */
  function tokens(s) { return s.match(/&(?:amp|lt|gt|quot);|[{}^_#`~]|[A-Za-z]+|\d+(?:[.,]\d+)*|\s+|[\s\S]/g) || []; }
  function tree(tk) {
    var st = { i: 0 };
    function seq(depth) {
      var out = [];
      while (st.i < tk.length) {
        var t = tk[st.i++];
        if (t === "{") out.push({ g: seq(depth + 1) });
        else if (t === "}") { if (depth > 0) return out; }   /* 짝 없는 } 는 버린다 */
        else out.push(t);
      }
      return out;
    }
    return seq(0);
  }
  function isSp(t) { return typeof t === "string" && (/^\s+$/.test(t) || t === "`" || t === "~"); }
  function word(t) { return GREEK[t] || (Object.prototype.hasOwnProperty.call(OPS, t) ? OPS[t] : t); }

  /* 묶음 나무 → HTML. small: 위·아래 첨자 안(분수를 a/b 로) */
  function render(seq, small) {
    var items = [], i = 0, sp = false;
    function operand() {
      while (i < seq.length && isSp(seq[i])) i++;
      if (i >= seq.length) return "";
      var t = seq[i++];
      if (typeof t === "object") return render(t.g, small);
      if (/^(LEFT|RIGHT|left|right)$/.test(t)) return operand();
      if (PRE[t]) return PRE[t](operand());
      if (BLOCK[t]) return block(t, operand());
      return /^[A-Za-z]+$/.test(t) ? word(t) : t;
    }
    function sub(tag) {
      while (i < seq.length && isSp(seq[i])) i++;
      var t = seq[i], a;
      if (t && typeof t === "object") { i++; a = render(t.g, true); } else a = operand();
      return "<" + tag + ">" + a + "</" + tag + ">";
    }
    function push(h, extra) { var it = { h: h, sp: sp }; if (extra) for (var k in extra) it[k] = extra[k]; items.push(it); sp = false; }
    while (i < seq.length) {
      var t = seq[i++];
      if (typeof t === "object") { push(render(t.g, small)); continue; }
      if (isSp(t) || t === "&amp;") { sp = true; continue; }
      if (t === "^" || t === "_") {
        var h = sub(t === "^" ? "sup" : "sub"), last = items[items.length - 1];
        if (last && !last.op && !last.nl) last.h += h; else push(h);
        continue;
      }
      if (t === "#") { push("", { nl: 1 }); continue; }
      if (/^[A-Za-z]+$/.test(t)) {
        if (/^(LEFT|RIGHT|left|right)$/.test(t)) continue;
        if (t === "over" || t === "atop") { push("", { op: t }); continue; }
        if (PRE[t]) { push(PRE[t](operand())); continue; }
        if (BLOCK[t]) { push(block(t, operand())); continue; }
        push(word(t)); continue;
      }
      push(t);
    }
    /* over·atop — 바로 앞뒤 한 덩어리씩 */
    for (var k = 0; k < items.length; k++) {
      if (!items[k].op) continue;
      var a = k > 0 && !items[k - 1].op && !items[k - 1].nl ? items[k - 1] : null, b = items[k + 1] && !items[k + 1].op && !items[k + 1].nl ? items[k + 1] : null;
      var num = a ? a.h : "", den = b ? b.h : "";
      var fr = small ? num + "/" + den
        : '<span class="fr"><span' + (items[k].op === "atop" ? ' style="border:0"' : "") + ">" + num + "</span><span>" + den + "</span></span>";
      var start = a ? k - 1 : k, n = 1 + (a ? 1 : 0) + (b ? 1 : 0);
      items.splice(start, n, { h: fr, sp: a ? a.sp : items[k].sp });
      k = start;
    }
    var out = "";
    items.forEach(function (it, j) { out += (it.sp && j ? " " : "") + (it.nl ? "<br>" : it.h); });
    return out;
  }
  function block(kind, inner) {
    inner = inner.replace(/(<br>)+$/, "");
    var col = '<span style="display:inline-block;vertical-align:middle;text-align:left;line-height:1.35">' + inner + "</span>";
    if (kind === "cases") return '<span style="display:inline-flex;align-items:center"><span class="cs" style="font-size:1.9em;line-height:1;margin-right:3px;font-weight:300">{</span>' + col + "</span>";
    if (kind === "pmatrix") return "(" + col + ")";
    if (kind === "bmatrix") return "[" + col + "]";
    if (kind === "dmatrix") return "|" + col + "|";
    return col;
  }

  /* 수식 한 덩어리 → HTML(이미 이스케이프된 글을 받는다) */
  function eq(s) {
    s = s.replace(/\u0003/g, " ");
    /* 수식 표시가 하나도 없는 한글 글(묶음 상자에 든 설명 글)은 글 그대로 — 수식 글꼴·줄 안 바꿈을 입히지 않는다 */
    if (!MARK.test(s) && /[가-힣]{2,}[^{}]*\s[^{}]*[가-힣]{2,}/.test(s)) return inline(s.replace(/[`~]/g, " ").replace(/\s{2,}/g, " ").trim());
    var g = render(tree(tokens(s)), false).replace(/\s{2,}/g, " ").trim();
    return '<span class="eq">' + g + "</span>";
  }

  function cell(c) { return c.split("\u0003").map(function (l) { return inline(l.trim()); }).filter(function (l) { return l; }).join("<br>"); }
  function table(rows) {
    var w = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    return '<div class="tblw"><table class="qt">' + rows.map(function (r) {
      while (r.length < w) r.push("");
      return "<tr>" + r.map(function (c) { c = c.trim(); return "<td" + (/^[-+(]?[￦$]?[\d,.]+%?\)?$/.test(c) ? ' class="n"' : "") + ">" + cell(c) + "</td>"; }).join("") + "</tr>";
    }).join("") + "</table></div>";
  }

  /* 글 안의 { } — 「|」 가 있으면 중첩 표, 아니면 수식 */
  function inline(s) {
    var out = "", i = 0;
    while (i < s.length) {
      var a = s.indexOf("{", i);
      if (a < 0) { out += s.slice(i); break; }
      var b = close(s, a);
      out += s.slice(i, a);
      if (b < 0) { i = a + 1; continue; }   /* 짝 없는 { (추출 때 남은 것)는 버리고 뒤를 계속 읽는다 */
      var body = s.slice(a + 1, b);
      if (body.indexOf("|") >= 0 && body.indexOf(" / ") >= 0) out += table(body.split(" / ").map(function (r) { return r.split("|"); }));
      else if (body.indexOf("\u0003") >= 0 && !MARK.test(body)) out += body.split("\u0003").map(function (l) { return inline(l.trim()); }).filter(function (l) { return l; }).join("<br>");
      else out += eq(body);
      i = b + 1;
    }
    return out.replace(/\u0003/g, " ").replace(/\}/g, function () { return ""; });
  }

  /* 여러 줄에 걸친 { … } 안의 줄바꿈은 \u0003 으로 감춰 한 줄로 읽게 한다 */
  function keepGroups(s) {
    var out = "", i = 0;
    while (i < s.length) {
      var a = s.indexOf("{", i);
      if (a < 0) { out += s.slice(i); break; }
      var b = close(s, a);
      if (b < 0) { out += s.slice(i, a + 1); i = a + 1; continue; }
      out += s.slice(i, a) + s.slice(a, b + 1).replace(/\n/g, "\u0003");
      i = b + 1;
    }
    return out;
  }

  /* 연속된 「 | 」 줄은 표로 */
  window.RICH = function (text) {
    var lines = keepGroups(esc(text).replace(/\r/g, "")).split("\n"), out = [], buf = [];
    function flush() { if (buf.length) { out.push(buf.length > 1 ? table(buf.map(function (l) { return l.split("|"); })) : inline(buf[0])); buf = []; } }
    lines.forEach(function (l) {
      if ((l.match(/\|/g) || []).length >= 1 && !/^\s*\{/.test(l) && l.indexOf("{") < 0) buf.push(l);
      else { flush(); out.push(inline(l)); }
    });
    flush();
    return out.join("\n").replace(/\n?(<div class="tblw">)/g, "$1").replace(/(<\/table><\/div>)\n?/g, "$1")
      /* ③ 그림: [[그림:파일.png]] → data/img/파일.png (원본 시험지에서 오린 그래프·도표, 1013) */
      .replace(/\[\[그림:([\w.\-가-힣]+\.(png|jpg|webp))\]\]/g, '<img class="qimg" src="data/img/$1" alt="문항 그림" loading="lazy">');
  };
})();
