// Standalone (GitHub Pages) extras: offline cache + backup/restore of progress kept in this browser.
(function(){
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").then(reg => {
      reg.addEventListener("updatefound", () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) showNote("A newer version is ready.", "Reload", () => location.reload());
        });
      });
    }).catch(() => {}));
  }
  function showNote(text, label, fn){
    const n = document.createElement("div");
    n.className = "sa-note"; n.innerHTML = `<span></span><button type="button"></button>`;
    n.querySelector("span").textContent = text; const b = n.querySelector("button"); b.textContent = label; b.onclick = fn;
    document.body.appendChild(n);
  }
  const KEYS = () => Object.keys(localStorage).filter(k => k.startsWith("ipd_"));
  function backup(){
    const data = {}; KEYS().forEach(k => { data[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify({app:"interview-prep-desk", at:new Date().toISOString(), data}, null, 1)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `interview-prep-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function restore(){
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/json,.json";
    inp.onchange = async () => {
      try{
        const j = JSON.parse(await inp.files[0].text());
        if (j.app !== "interview-prep-desk" || !j.data) throw 0;
        if (!confirm("Replace the progress saved in this browser with the backup?")) return;
        Object.entries(j.data).forEach(([k,v]) => { if (k.startsWith("ipd_")) localStorage.setItem(k, v); });
        location.reload();
      }catch(e){ alert("That file isn't an Interview Prep Desk backup."); }
    };
    inp.click();
  }
  document.addEventListener("DOMContentLoaded", () => {
    const sync = document.getElementById("sync"); if (!sync) return;
    const box = document.createElement("span"); box.className = "sa-tools";
    box.innerHTML = `<button type="button" class="sa-btn" title="Download your progress, notes and interviews as a file">Backup</button><button type="button" class="sa-btn" title="Load a backup file into this browser">Restore</button>`;
    const [b1, b2] = box.querySelectorAll("button"); b1.onclick = backup; b2.onclick = restore;
    sync.after(box);
  });
})();
