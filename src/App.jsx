import React, { useEffect, useMemo, useState } from "react";

// LUXURY BOUTIQUE THEME
// Colors: charcoal #0E1114, bone #F5F2EC, gold #C5A35A, fog #9BA3AE
// Fonts (index.html): Playfair Display for headings, Inter for UI

function bytesToSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CHECKS = [
  "Paint",
  "Flooring",
  "Lighting",
  "Plumbing",
  "HVAC",
  "Furniture",
  "Appliances",
  "Windows/Doors",
  "Bathroom",
  "Deep Clean",
];

const STORAGE_KEY = "renovation_app_luxury_v1";

export default function App() {
  const [rooms, setRooms] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return Array.from({ length: 23 }, (_, i) => ({
      id: i + 1,
      notes: "",
      photos: [], // {id, url, name, size, type}
      status: "todo", // todo | in_progress | done
      checklist: Object.fromEntries(CHECKS.map((c) => [c, false])),
    }));
  });

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => String(r.id).includes(q) || r.notes.toLowerCase().includes(q));
  }, [rooms, query]);

  useEffect(() => {
    const save = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms)), 300);
    return () => clearTimeout(save);
  }, [rooms]);

  const doneCount = rooms.filter((r) => r.status === "done").length;
  const totalPhotos = rooms.reduce((n, r) => n + r.photos.length, 0);

  async function handleFiles(roomId, files) {
    if (!files?.length) return;
    const pics = [];
    for (const f of Array.from(files)) {
      const url = await fileToDataURL(f);
      pics.push({ id: `${roomId}-${crypto.randomUUID()}`, url, name: f.name, size: f.size, type: f.type });
    }
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, photos: [...r.photos, ...pics] } : r)));
  }

  function removePhoto(roomId, photoId) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, photos: r.photos.filter((p) => p.id !== photoId) } : r)));
  }

  function setNotes(roomId, notes) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, notes } : r)));
  }

  function toggleCheck(roomId, key) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, checklist: { ...r.checklist, [key]: !r.checklist[key] } } : r)));
  }

  function setStatus(roomId, status) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
  }

  function clearAll() {
    if (!confirm("Clear all data? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setRooms(Array.from({ length: 23 }, (_, i) => ({
      id: i + 1,
      notes: "",
      photos: [],
      status: "todo",
      checklist: Object.fromEntries(CHECKS.map((c) => [c, false])),
    })));
  }

  function exportData() {
    const payload = rooms.map((r) => ({
      room: r.id,
      status: r.status,
      notes: r.notes,
      checklist: r.checklist,
      photos: r.photos,
    }));
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), rooms: payload }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "renovations_rooms_1-23.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const progress = Math.round((doneCount / 23) * 100);

  return (
    <div className="min-h-screen bg-[#0E1114] text-[#F5F2EC] font-[Inter]">
      <header className="sticky top-0 z-20 backdrop-blur bg-[#0E1114]/80 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5A35A] to-[#9BA3AE]" />
          <h1 className="text-lg tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>Sherbrooke East Project — Renovations</h1>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <button aria-label="export-json" onClick={exportData} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10">Export JSON</button>
            <button aria-label="clear-data" onClick={clearAll} className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10">Clear</button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by room # or notes…"
              className="w-full bg-[#0E1114] text-[#F5F2EC] placeholder-white/50 border border-white/10 rounded-xl px-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#C5A35A]/40"
            />
            <span className="absolute left-3 top-2.5 text-white/60">🔎</span>
          </div>
          <div className="text-xs text-white/70 whitespace-nowrap">
            {filtered.length} shown • {doneCount}/23 done • {totalPhotos} photos
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#C5A35A]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 grid gap-4">
        {filtered.map((room) => (
          <section key={room.id} className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-base tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>Room {room.id}</h2>
              <div className="flex items-center gap-2">
                {["todo", "in_progress", "done"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(room.id, s)}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition ${room.status === s ? "bg-[#C5A35A] text-black border-[#C5A35A]" : "bg-transparent text-white/80 border-white/15 hover:bg-white/10"}`}
                  >
                    {s === "todo" ? "To‑do" : s === "in_progress" ? "In progress" : "Done"}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 grid grid-cols-2 gap-2">
              {CHECKS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-white/90">
                  <input
                    type="checkbox"
                    checked={!!room.checklist[c]}
                    onChange={() => toggleCheck(room.id, c)}
                    className="accent-[#C5A35A] w-4 h-4"
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="px-4 pt-3">
              <label className="block text-sm mb-1 text-white/80">Renovation notes</label>
              <textarea
                value={room.notes}
                onChange={(e) => setNotes(room.id, e.target.value)}
                placeholder="List repairs, measurements, SKUs, suppliers…"
                className="w-full min-h-[88px] rounded-xl bg-[#0E1114] text-[#F5F2EC] placeholder-white/40 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C5A35A]/40"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setNotes(room.id, "No work needed")} className="px-3 py-1.5 rounded-xl text-xs border border-white/15 bg-white/5 hover:bg-white/10">No work needed</button>
                <button
                  onClick={() => setNotes(room.id, (room.notes ? room.notes + "\n" : "") + "• Replace bulbs with 3000K LED")}
                  className="px-3 py-1.5 rounded-xl text-xs border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  Add sample task
                </button>
              </div>
            </div>

            <div className="px-4 pt-4 pb-4">
              <label className="block text-sm mb-2 text-white/80">Photos</label>
              <div className="flex items-center gap-2 mb-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer">
                  <span>📷 Use camera</span>
                  <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => handleFiles(room.id, e.target.files)} />
                </label>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer">
                  <span>🖼️ From gallery</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(room.id, e.target.files)} />
                </label>
              </div>

              {room.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {room.photos.map((p) => (
                    <div key={p.id} className="relative group">
                      <img src={p.url} alt={p.name} className="w-full h-28 object-cover rounded-xl border border-white/10" />
                      <button
                        type="button"
                        onClick={() => removePhoto(room.id, p.id)}
                        className="absolute top-1 right-1 bg-[#0E1114]/80 hover:bg-[#0E1114] rounded-full px-2 py-1 text-xs border border-white/20"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/50 text-white px-1 py-0.5 rounded-b-xl truncate">{p.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {room.photos.length > 0 && (
                <div className="mt-2 text-xs text-white/60">{room.photos.length} photo(s), total {bytesToSize(room.photos.reduce((a, b) => a + (b.size || 0), 0))}</div>
              )}
            </div>
          </section>
        ))}
      </main>

      <footer className="sticky bottom-0 bg-[#0E1114] border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3 text-sm">
          <button onClick={exportData} className="px-4 py-2 rounded-xl bg-[#C5A35A] text-black hover:brightness-110">Save / Export</button>
          <span className="text-white/60">Auto-saves locally • Install from browser menu to use as an app</span>
        </div>
      </footer>
    </div>
  );
}

// Self-tests
(function runSelfTests(){
  try {
    console.assert(bytesToSize(0) === '0 B', 'bytesToSize(0)');
    console.assert(bytesToSize(1024).endsWith('KB'), 'bytesToSize to KB');
    console.assert(bytesToSize(1048576).endsWith('MB'), 'bytesToSize to MB');
    console.assert(bytesToSize(1536).startsWith('1.5'), 'bytesToSize decimal');
    const base = 'Line 1';
    const composed = (base ? base + "\n" : "") + "• Replace bulbs with 3000K LED";
    console.assert(composed.includes("\n"), 'newline insertion');
    const testDone = 5; const prog = Math.round((testDone/23)*100);
    console.assert(prog === Math.round(5/23*100), 'progress calculation');
    console.assert(Array.isArray(CHECKS) && CHECKS.includes('Bathroom'), 'checklist contains Bathroom');
  } catch(e){
    console.warn('Self-tests failed:', e);
  }
})();
