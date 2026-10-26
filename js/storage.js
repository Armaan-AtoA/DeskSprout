(() => {
const KEY = 'desk_sprout_save_v3';
const SALT = 'desk-sprout-open-save-v3';
let volatileSave = null;

const encode = value => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
const decode = value => JSON.parse(decodeURIComponent(escape(atob(value))));

async function digest(text) {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(`${SALT}:${text}`);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  let hash = 2166136261;
  for (const char of `${SALT}:${text}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `fallback-${(hash >>> 0).toString(16)}`;
}

function getRaw() { try { return localStorage.getItem(KEY); } catch { return volatileSave; } }
function setRaw(value) { try { localStorage.setItem(KEY, value); } catch { volatileSave = value; } }
function clearRaw() { try { localStorage.removeItem(KEY); } catch { volatileSave = null; } }

async function save(state) {
  if (!state) return;
  state.savedAt = new Date().toISOString();
  state.savedTimestamp = Math.floor(Date.now() / 1000);
  const packed = await pack(state);
  setRaw(JSON.stringify(packed));
}

async function load() {
  const raw = getRaw();
  if (!raw) return null;
  try {
    return await unpack(JSON.parse(raw));
  } catch {
    // Try loading v2 save
    try {
      const oldKey = 'desk_plant_save';
      const oldRaw = localStorage.getItem(oldKey);
      if (oldRaw) {
        const oldSalt = 'desk-sprout-open-save-v1';
        const oldContainer = JSON.parse(oldRaw);
        const oldData = JSON.parse(decodeURIComponent(escape(atob(oldContainer.data))));
        // Migrate v2 -> v3
        if (oldData && oldData.plantId) {
          oldData.version = 3;
          oldData.playstyle = oldData.playstyle || 'fast';
          oldData.startType = oldData.startType || 'seed';
          oldData.milestonesFertilized = oldData.milestonesFertilized || [];
          oldData.plantInVase = oldData.plantInVase || false;
          oldData.weatherState = oldData.weatherState || null;
          oldData.theme = oldData.theme || 'dark';
          localStorage.removeItem(oldKey);
          await save(oldData);
          return oldData;
        }
      }
    } catch {}
    clearRaw();
    return null;
  }
}

async function pack(state) {
  const data = encode(state);
  return { data, checksum: await digest(data), version: 3 };
}

async function unpack(container) {
  if (!container?.data || !container?.checksum || await digest(container.data) !== container.checksum)
    throw new Error('Checksum mismatch');
  return decode(container.data);
}

async function download(state) {
  const blob = new Blob([JSON.stringify(await pack(state), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `desksprout-${state.plantId}-${new Date().toISOString().slice(0, 10)}.plant`;
  a.click();
  URL.revokeObjectURL(url);
}

async function readImport(file) {
  return unpack(JSON.parse(await file.text()));
}

window.DeskStorage = { save, load, pack, unpack, download, readImport };
})();
