(() => {
const { createState, catchUp, care, changeLocation, toggleVase, isValidState } = window.DeskEngine;
const { download, load, readImport, save } = window.DeskStorage;
const { openNotice, openPlantModal, populateSelectors, render, renderWizard, wizardState } = window.DeskUI;
const { PLANTS, LOCATIONS } = window.DeskConfig;

let state;

async function persist() {
  if (state) {
    state.savedAt = new Date().toISOString();
    state.savedTimestamp = Math.floor(Date.now() / 1000);
    if (Number.isFinite(state.nextWeeklySupplyTime)) {
      state.nextWeeklySupplyDate = new Date(state.nextWeeklySupplyTime * 1000).toISOString();
    }
  }
  await save(state);
}

function update() {
  catchUp(state);
  render(state);

  // Check for genuine emergencies to notify player (No popups on normal actions!)
  if (state && state.pendingEmergency) {
    const em = state.pendingEmergency;
    state.pendingEmergency = null;
    openNotice(em.title, em.message);
  }
}

function toggleTheme() {
  if (!state) return;
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  render(state);
  persist();
}

async function start() {
  populateSelectors();
  const restored = await load();
  if (isValidState(restored)) {
    state = restored;
    if (!state.milestonesFertilized) state.milestonesFertilized = [];
    if (!state.theme) state.theme = 'dark';
    if (!state.emergencyAlertsSent) state.emergencyAlertsSent = {};
  } else {
    // Default: Lucky Bamboo at Computer Table, Fast playstyle
    state = createState('dracaena', 'computer', 'fast', 'seed', false);
    openPlantModal();
  }

  update();

  // Periodic simulation tick (1s) and persistent storage (10s)
  setInterval(update, 1000);
  setInterval(persist, 10000);
  window.addEventListener('beforeunload', () => { persist(); });

  // Theme Toggle Button
  const themeBtn = document.querySelector('#theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Care Console Actions (No popup on normal care actions!)
  const careGrid = document.querySelector('#care-actions-grid');
  if (careGrid) {
    careGrid.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn || btn.disabled) return;
      care(state, btn.dataset.action);
      update();
      persist();
    });
  }

  // Vessel Toggle Button (Pot vs Vase) - No popup!
  const vesselBox = document.querySelector('#vessel-control-box');
  if (vesselBox) {
    vesselBox.addEventListener('click', e => {
      if (e.target.closest('#toggle-vessel-btn')) {
        toggleVase(state);
        update();
        persist();
      }
    });
  }

  // Room / Location Selection - Just changes environment stats underneath!
  const locSelect = document.querySelector('#location-select');
  if (locSelect) {
    locSelect.addEventListener('change', e => {
      changeLocation(state, e.target.value);
      update();
      persist();
    });
  }

  // New Plant Wizard Trigger
  document.querySelector('#new-plant-button').addEventListener('click', openPlantModal);

  // Wizard Step 1: Start Form Cards
  document.querySelectorAll('input[name="startType"]').forEach(r => {
    r.addEventListener('change', e => {
      wizardState.startType = e.target.value;
      document.querySelectorAll('#wizard-page-1 .selection-card').forEach(c => c.classList.remove('selected'));
      e.target.closest('.selection-card')?.classList.add('selected');
    });
  });

  // Wizard Step 2: Species Carousel Navigation
  document.querySelector('#carousel-prev-btn')?.addEventListener('click', () => {
    wizardState.plantIndex = (wizardState.plantIndex - 1 + PLANTS.length) % PLANTS.length;
    renderWizard();
  });
  document.querySelector('#carousel-next-btn')?.addEventListener('click', () => {
    wizardState.plantIndex = (wizardState.plantIndex + 1) % PLANTS.length;
    renderWizard();
  });

  // Wizard Step 3: Playstyle Selection
  document.querySelectorAll('input[name="playstyle"]').forEach(r => {
    r.addEventListener('change', e => {
      wizardState.playstyle = e.target.value;
      document.querySelectorAll('#wizard-page-3 .selection-card').forEach(c => c.classList.remove('selected'));
      e.target.closest('.selection-card')?.classList.add('selected');
    });
  });

  // Wizard Navigation: Next & Back
  document.querySelector('#wizard-next-btn')?.addEventListener('click', () => {
    if (wizardState.step < 4) {
      wizardState.step++;
      const curPlant = PLANTS[wizardState.plantIndex];
      const vaseOptionBox = document.querySelector('#wizard-vase-option');
      if (vaseOptionBox) {
        vaseOptionBox.style.display = curPlant.supportsVase ? 'block' : 'none';
      }
      renderWizard();
    } else {
      // Finalize and create new plant
      const curPlant = PLANTS[wizardState.plantIndex];
      const startLoc = document.querySelector('#start-location')?.value || 'computer';
      const inVase = curPlant.supportsVase && Boolean(document.querySelector('#wizard-vase-checkbox')?.checked);
      state = createState(curPlant.id, startLoc, wizardState.playstyle, wizardState.startType, inVase);
      state.theme = document.documentElement.getAttribute('data-theme') || 'dark';
      document.querySelector('#plant-modal').close();
      update();
      persist();
    }
  });

  document.querySelector('#wizard-back-btn')?.addEventListener('click', () => {
    if (wizardState.step > 1) {
      wizardState.step--;
      renderWizard();
    }
  });

  // Export Save
  document.querySelector('#export-button').addEventListener('click', () => download(state));

  // Import Save
  document.querySelector('#import-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const candidate = await readImport(file);
      if (!isValidState(candidate)) throw Error('Invalid save state format');
      state = candidate;
      update();
      await persist();
    } catch {
      openNotice('CORRUPT SAVE', 'Unable to import: save checksum mismatch or file corrupted.');
    }
    e.target.value = '';
  });

  // Instructions Modal
  const instrModal = document.querySelector('#instructions-modal');
  document.querySelector('#instructions-btn')?.addEventListener('click', () => {
    instrModal?.showModal();
  });
  document.querySelector('#instructions-close-btn')?.addEventListener('click', () => {
    instrModal?.close();
  });

  // Modal Closures
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('dialog')?.close());
  });
  document.querySelector('#notice-ok-btn')?.addEventListener('click', () => {
    document.querySelector('#notice-modal')?.close();
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', e => {
      if (e.target === dialog) dialog.close();
    });
  });

  // Global Keyboard Shortcuts (No popups on hotkeys!)
  window.addEventListener('keydown', e => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    const plantModal = document.querySelector('#plant-modal');
    const isWizardOpen = plantModal && plantModal.open;

    if (isWizardOpen) {
      if (wizardState.step === 2) {
        if (e.key === 'ArrowLeft') {
          wizardState.plantIndex = (wizardState.plantIndex - 1 + PLANTS.length) % PLANTS.length;
          renderWizard();
          return;
        }
        if (e.key === 'ArrowRight') {
          wizardState.plantIndex = (wizardState.plantIndex + 1) % PLANTS.length;
          renderWizard();
          return;
        }
      }
      return;
    }

    const key = e.key.toLowerCase();
    if (key === 'w') {
      care(state, 'water');
      update(); persist();
    } else if (key === 'f') {
      care(state, 'fertilize');
      update(); persist();
    } else if (key === 'b' || key === 's') {
      care(state, 'spray');
      update(); persist();
    } else if (key === 'p') {
      care(state, 'prune');
      update(); persist();
    } else if (key === 'v') {
      toggleVase(state);
      update(); persist();
    } else if (key === 't') {
      toggleTheme();
    } else if (key === 'n') {
      openPlantModal();
    } else if (key === 'i') {
      instrModal?.showModal();
    } else if (key === 'e') {
      download(state);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Cycle locations
      const curIdx = LOCATIONS.findIndex(l => l.id === state.locationId);
      const nextIdx = e.key === 'ArrowRight'
        ? (curIdx + 1) % LOCATIONS.length
        : (curIdx - 1 + LOCATIONS.length) % LOCATIONS.length;
      changeLocation(state, LOCATIONS[nextIdx].id);
      update(); persist();
    }
  });
}

start();
})();
