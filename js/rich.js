/* ═══════════════════════════════════════════════════════════
   모두의 전문직 — 기출 글 표·수식 그리기 (2026-10-08)
   수집기가 남긴 두 표기를 HTML 로 바꾼다.
   ① 표: 줄마다 「 | 」 로 칸을 나눈 연속 줄, 또는 { … | … / … } (중첩 표 — 「 / 」 가 행 구분)
   ② 한글 수식: { … } 안의 한글(HWP) 수식 스크립트 — over·sqrt·_{}·^{}·LEFT/RIGHT·bar·그리스 문자
   RICH(글) 은 글을 먼저 이스케이프한 뒤 표시만 덧씌운다 — 원문에 HTML 이 들어가지 않는다.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var GREEK = { alpha: "α", beta: "β", gamma: "γ", delta: "δ", DELTA: "Δ", Delta: "Δ", epsilon: "ε", varepsilon: "ε", theta: "θ", lambda: "λ",
    mu: "μ", pi: "π", rho: "ρ", sigma: "σ", SIGMA: "Σ", Sigma: "Σ", tau: "τ", phi: "φ", omega: "ω", eta: "η", infty: "∞", partial: "∂" };
  var OPS = { TIMES: "×", times: "×", cdot: "·", DIV: "÷", div: "÷", le: "≤", leq: "≤", ge: "≥", geq: "≥", neq: "≠", "+-": "±", sum: "Σ", SMALLSUM: "Σ",
    prime: "′", sim: "∼", approx: "≈", rarrow: "→", rightarrow: "→", larrow: "←", LRARROW: "⇔", "->": "→", int: "∫" };

  /* 짝 맞는 { } 의 끝 위치 */
  function close(s, i) { var d = 0; for (var j = i; j < s.length; j++) { if (s[j] === "{") d++; else if (s[j] === "}") { d--; if (!d) return j; } } return -1; }

  /* 수식 한 덩어리 → HTML(이미 이스케이프된 글을 받는다) */
  function eq(s) {
    s = s.replace(/`|~/g, " ");
    /* 안쪽 { } 부터 재귀로 */
    function group(t) {
      var out = "", i = 0;
      while (i < t.length) {
        if (t[i] === "{") { var j = close(t, i); if (j < 0) { out += t.slice(i); break; } out += "\u0001" + group(t.slice(i + 1, j)) + "\u0002"; i = j + 1; }
        else out += t[i++];
      }
      return out;
    }
    var g = group(s);
    /* 묶음 토큰: \u0001 … \u0002 (안쪽부터 처리했으므로 정규식은 안쪽 묶음만 잡는다) */
    var B = "\u0001([^\u0001\u0002]*)\u0002";
    for (var k = 0; k < 8; k++) {
      var before = g;
      g = g.replace(new RegExp("(?:" + B + "|(\\S+?))\\s*over\\s*(?:" + B + "|(\\S+))", "g"), function (m, a1, a2, b1, b2) {
        return '<span class="fr"><span>' + (a1 != null ? a1 : a2) + "</span><span>" + (b1 != null ? b1 : b2) + "</span></span>";
      });
      g = g.replace(new RegExp("sqrt\\s*(?:" + B + "|(\\S+))", "g"), function (m, a, b) { return '√<span class="ov">' + (a != null ? a : b) + "</span>"; });
      g = g.replace(new RegExp("(?:bar|overline)\\s*(?:" + B + "|(\\S))", "g"), function (m, a, b) { return '<span class="ov">' + (a != null ? a : b) + "</span>"; });
      g = g.replace(new RegExp("hat\\s*(?:" + B + "|(\\S))", "g"), function (m, a, b) { return (a != null ? a : b) + "̂"; });
      g = g.replace(new RegExp("_\\s*(?:" + B + "|(\\S))", "g"), function (m, a, b) { return "<sub>" + (a != null ? a : b) + "</sub>"; });
      g = g.replace(new RegExp("\\^\\s*(?:" + B + "|(\\S))", "g"), function (m, a, b) { return "<sup>" + (a != null ? a : b) + "</sup>"; });
      g = g.replace(new RegExp(B, "g"), "$1");
      if (g === before) break;
    }
    g = g.replace(/\b(LEFT|RIGHT|left|right)\s*/g, "").replace(/\brm\s*|\bit\s+/g, "");
    g = g.replace(/\b([A-Za-z]+)\b/g, function (m, w) { return GREEK[w] || OPS[w] || w; });
    g = g.replace(/[\u0001\u0002]/g, "").replace(/\s{2,}/g, " ").trim();
    return '<span class="eq">' + g + "</span>";
  }

  function table(rows) {
    var w = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    return '<div class="tblw"><table class="qt">' + rows.map(function (r) {
      while (r.length < w) r.push("");
      return "<tr>" + r.map(function (c) { c = c.trim(); return "<td" + (/^[-+(]?[￦$]?[\d,.]+%?\)?$/.test(c) ? ' class="n"' : "") + ">" + inline(c) + "</td>"; }).join("") + "</tr>";
    }).join("") + "</table></div>";
  }

  /* 글 안의 { } — 「|」 가 있으면 중첩 표, 아니면 수식 */
  function inline(s) {
    var out = "", i = 0;
    while (i < s.length) {
      var a = s.indexOf("{", i);
      if (a < 0) { out += s.slice(i); break; }
      var b = close(s, a);
      if (b < 0) { out += s.slice(i); break; }
      out += s.slice(i, a);
      var body = s.slice(a + 1, b);
      if (body.indexOf("|") >= 0 && body.indexOf(" / ") >= 0) out += table(body.split(" / ").map(function (r) { return r.split("|"); }));
      else out += eq(body);
      i = b + 1;
    }
    return out;
  }

  /* 연속된 「 | 」 줄은 표로 */
  window.RICH = function (text) {
    var lines = esc(text).split("\n"), out = [], buf = [];
    function flush() { if (buf.length) { out.push(buf.length > 1 ? table(buf.map(function (l) { return l.split("|"); })) : inline(buf[0])); buf = []; } }
    lines.forEach(function (l) {
      if ((l.match(/\|/g) || []).length >= 1 && !/^\s*\{/.test(l) && l.indexOf("{") < 0) buf.push(l);
      else { flush(); out.push(inline(l)); }
    });
    flush();
    return out.join("\n").replace(/\n?(<div class="tblw">)/g, "$1").replace(/(<\/table><\/div>)\n?/g, "$1");
  };
})();
