console.log("quick js loaded checked !!!!");

const SAMPLE = [
  { start: 1, end: 3 },
  { start: 2, end: 5 },
  { start: 4, end: 6 },
  { start: 6, end: 7 },
  { start: 5, end: 9 },
  { start: 8, end: 10 },
];

function greedy(tasks) {
  const sorted = [...tasks].sort((a, b) => a.end - b.end);
  const selected = [];
  let lastEnd = -Infinity;
  for (const t of sorted) {
    if (t.start >= lastEnd) {
      selected.push(t);
      lastEnd = t.end;
    }
  }
  return selected;
}

function bruteForce(tasks) {
  let best = [];
  for (let mask = 0; mask < 1 << tasks.length; mask++) {
    const subset = tasks.filter((_, i) => mask & (1 << i));
    const sorted = [...subset].sort((a, b) => a.start - b.start);
    let valid = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) {
        valid = false;
        break;
      }
    }
    if (valid && subset.length > best.length) best = subset;
  }
  return best;
}

function generateTasks(n) {
  return Array.from({ length: n }, () => {
    const start = Math.floor(Math.random() * 10000);
    return { start, end: start + Math.floor(Math.random() * 300) + 10 };
  });
}

function fmt(ms) {
  return ms < 1 ? `${ms.toFixed(3)} ms` : `${ms.toFixed(2)} ms`;
}

function time(fn) {
  const t = performance.now();
  const r = fn();
  return { r, ms: performance.now() - t };
}

function tasksToHTML(list) {
  return list.map((t) => `<span>[${t.start}→${t.end}]</span>`).join("");
}

window.onload = function () {
  const tbody = document.querySelector("#sampleTable tbody");
  SAMPLE.forEach((t, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>T${i + 1}</td><td>${t.start}</td><td>${t.end}</td>`;
    tbody.appendChild(tr);
  });
};

function runSample() {
  const g = time(() => greedy(SAMPLE));
  const b = time(() => bruteForce(SAMPLE));
  const match = g.r.length === b.r.length;

  document.getElementById("sampleResult").innerHTML = `
    <div class="result-box">
      <strong>🟢 Greedy</strong> → ${g.r.length} tasks selected in ${fmt(g.ms)}<br>
      <div class="tasks-list" style="margin-top:6px">${tasksToHTML(g.r)}</div>
    </div>
    <div class="result-box" style="margin-top:10px">
      <strong>🔴 Brute Force</strong> → ${b.r.length} tasks selected in ${fmt(b.ms)}<br>
      <div class="tasks-list" style="margin-top:6px">${tasksToHTML(b.r)}</div>
    </div>
    <div class="result-box ${match ? "green" : "orange"}" style="margin-top:10px">
      ${match ? "✅ Both algorithms return the same optimal result." : "⚠️ Results differ!"}
    </div>
  `;
}

function runLarge() {
  const n = parseInt(document.getElementById("bigN").value) || 10000;
  const tasks = generateTasks(n);
  const g = time(() => greedy(tasks));

  document.getElementById("largeResult").innerHTML = `
    <div class="result-box green" style="margin-top:14px">
      <strong>🟢 Greedy on ${n.toLocaleString()} tasks</strong><br>
      Tasks selected: ${g.r.length}<br>
      Execution time: <strong>${fmt(g.ms)}</strong>
    </div>
    <div class="result-box orange" style="margin-top:10px">
      <strong>🔴 Brute Force</strong>: not executed.<br>
      For ${n} tasks, it would need to explore <strong>2^${n}</strong> combinations — that would take <em>billions of years</em>.
    </div>
  `;
}

function runStress() {
  const N = 18;

  const allOverlap = Array.from({ length: N }, (_, i) => ({
    start: i,
    end: N + 10,
  }));
  const nonOverlap = Array.from({ length: N }, (_, i) => ({
    start: i * 2,
    end: i * 2 + 1,
  }));
  const sameTimes = [
    ...Array.from({ length: 6 }, () => ({ start: 1, end: 5 })),
    ...Array.from({ length: 6 }, () => ({ start: 1, end: 3 })),
    { start: 3, end: 6 },
    { start: 6, end: 9 },
    { start: 9, end: 12 },
  ];

  function test(tasks, label) {
    const g = time(() => greedy(tasks));
    const b = time(() => bruteForce(tasks));
    return `
      <strong>${label}</strong> (n=${tasks.length})<br>
      Greedy: ${g.r.length} tasks in ${fmt(g.ms)} &nbsp;|&nbsp;
      Brute Force: ${b.r.length} tasks in ${fmt(b.ms)}<br>
      ${g.r.length === b.r.length ? "✅ Same result" : "⚠️ Difference detected"}
      <hr style="border:none;border-top:1px solid #ddd;margin:10px 0">
    `;
  }

  document.getElementById("stressResult").innerHTML = `
    <div class="result-box" style="margin-top:14px">
      ${test(allOverlap, "📌 All tasks overlap")}
      ${test(nonOverlap, "📌 No tasks overlap")}
      ${test(sameTimes, "📌 Same start / end times")}
    </div>
  `;
}
