(() => {
const { BALANCE, ITEMS, getLocation, getPlant, getPlaystyle } = window.DeskConfig;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function createState(plantId = 'dracaena', locationId = 'computer', playstyle = 'fast', startType = 'seed', plantInVase = false) {
  const now = Math.floor(Date.now() / 1000);
  const plant = getPlant(plantId);
  const startGrowth = startType === 'bud' ? 26 : 0;
  const initialVase = Boolean(plant.supportsVase && plantInVase);
  const weeklySupplyTime = now + (BALANCE.weeklySupplyInterval || 604800);

  return {
    version: 3,
    plantId,
    locationId,
    playstyle,
    startType,
    moisture: initialVase ? 85 : 65,
    health: 100,
    growth: startGrowth,
    pests: false,
    sunburned: false,
    sunburnSeconds: 0,
    lightStarved: false,
    lightStarveSeconds: 0,
    rotting: false,
    rotSeconds: 0,
    fertilizerUntil: 0,
    overwaterSeconds: 0,
    chemicalStress: 0,
    pruned: false,
    plantInVase: initialVase,
    milestonesFertilized: [],
    milestonesRewarded: [],
    inventory: {
      water: 9999, // Unlimited tap water
      fertilizer: 1, // Given once at start, and one per milestone
      spray: 3,
      shears: 1
    },
    nextWeeklySupplyTime: weeklySupplyTime,
    nextWeeklySupplyDate: new Date(weeklySupplyTime * 1000).toISOString(),
    weatherState: null,
    emergencyAlertsSent: {},
    pendingEmergency: null,
    theme: 'dark',
    log: [{
      at: now,
      text: startType === 'bud'
        ? `A tender ${plant.name} bud begins its journey in ${getLocation(locationId).name}.`
        : `A fresh ${plant.name} seed has been planted in ${getLocation(locationId).name}.`
    }],
    lastUpdatedTimestamp: now,
    savedAt: new Date().toISOString()
  };
}

function isValidState(value) {
  return Boolean(
    value &&
    value.plantId &&
    value.locationId &&
    ['moisture', 'health', 'growth', 'lastUpdatedTimestamp'].every(k => Number.isFinite(value[k])) &&
    value.inventory &&
    Array.isArray(value.log)
  );
}

function log(state, text) {
  state.log.unshift({ at: Math.floor(Date.now() / 1000), text });
  state.log = state.log.slice(0, BALANCE.logLimit);
}

function getStage(state) {
  const plant = getPlant(state.plantId);
  const stages = plant.growthStages.length;
  return Math.min(stages - 1, Math.floor(state.growth / (100 / stages)));
}

function checkMilestones(state) {
  const plant = getPlant(state.plantId);
  const currentStage = getStage(state);
  if (!state.milestonesRewarded) state.milestonesRewarded = [];

  for (let s = 1; s <= currentStage; s++) {
    if (!state.milestonesRewarded.includes(s)) {
      state.milestonesRewarded.push(s);
      if (state.inventory.fertilizer < ITEMS.fertilizer.max) {
        state.inventory.fertilizer++;
        log(state, `★ Milestone reached: Stage ${s + 1}! +1 fertilizer awarded.`);
      }
    }
  }
}

function triggerEmergency(state, key, title, message) {
  if (!state.emergencyAlertsSent) state.emergencyAlertsSent = {};
  if (!state.emergencyAlertsSent[key]) {
    state.emergencyAlertsSent[key] = true;
    state.pendingEmergency = { title, message };
    log(state, `⚠️ [${title}] ${message}`);
  }
}

function resetEmergency(state, key) {
  if (state.emergencyAlertsSent && state.emergencyAlertsSent[key]) {
    delete state.emergencyAlertsSent[key];
  }
}

function updateWeather(state) {
  const location = getLocation(state.locationId);
  if (!location.isOutdoor || !location.weather) {
    state.weatherState = null;
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (state.weatherState && (now - (state.weatherState.lastChange || 0)) < BALANCE.weatherChangeInterval) {
    return;
  }

  const w = location.weather;
  const isRaining = Math.random() < w.rainChance;
  const wind = w.windRange[0] + Math.random() * (w.windRange[1] - w.windRange[0]);
  const temp = w.tempRange[0] + Math.random() * (w.tempRange[1] - w.tempRange[0]);
  const conditions = isRaining ? (wind > 12 ? 'stormy' : 'rainy') : (temp > 28 ? 'hot' : (wind > 10 ? 'breezy' : 'sunny'));

  state.weatherState = {
    isRaining,
    wind: Math.round(wind),
    temp: Math.round(temp),
    conditions,
    lastChange: now
  };

  if (isRaining) {
    state.moisture = clamp(state.moisture + 10, 0, 100);
  }
}

function checkWeeklySupply(state) {
  const now = Math.floor(Date.now() / 1000);
  const weeklyInterval = BALANCE.weeklySupplyInterval || 604800;

  if (!Number.isFinite(state.nextWeeklySupplyTime)) {
    state.nextWeeklySupplyTime = (state.lastUpdatedTimestamp || now) + weeklyInterval;
  }

  let refilled = false;
  if (now >= state.nextWeeklySupplyTime) {
    state.inventory.spray = ITEMS.spray.max;
    while (state.nextWeeklySupplyTime <= now) {
      state.nextWeeklySupplyTime += weeklyInterval;
    }
    state.nextWeeklySupplyDate = new Date(state.nextWeeklySupplyTime * 1000).toISOString();
    log(state, 'Weekly shipment arrived: Bug Spray refilled (5/5).');
    refilled = true;
  } else {
    state.nextWeeklySupplyDate = new Date(state.nextWeeklySupplyTime * 1000).toISOString();
  }
  return refilled;
}

function growthFactor(state, plant, location) {
  const ps = getPlaystyle(state.playstyle || 'fast');

  // Light optimality curve
  const sunDiff = Math.abs(location.sunlight - plant.optimalSunlight);
  let lightMultiplier = Math.max(0.04, 1 - (sunDiff / 80));

  // If severely light-starved, growth stalls!
  if (state.lightStarved) {
    lightMultiplier = 0.02;
  }

  // Humidity tolerance
  const [minHum, maxHum] = plant.humidityRange;
  let humMultiplier = 1.0;
  if (location.humidity < minHum) {
    humMultiplier = Math.max(0.1, 1 - (minHum - location.humidity) / 60);
  } else if (location.humidity > maxHum) {
    humMultiplier = Math.max(0.1, 1 - (location.humidity - maxHum) / 60);
  }

  // Outdoor climate match
  let outdoorMultiplier = 1.0;
  if (location.isOutdoor) {
    outdoorMultiplier += (plant.outdoorAffinity || 0);
  } else if (plant.outdoorAffinity > 0.2) {
    // Plant loves outdoor breeze & sun, grows slightly slower locked in stale indoor room
    outdoorMultiplier = 0.88;
  }

  // Fertilizer boost (+60% growth rate)
  const isFertilized = state.fertilizerUntil > Date.now() / 1000;
  const fertBoost = isFertilized ? (1 + BALANCE.fertilizerBoost) : 1.0;

  // Health and pruning penalty
  const healthFactor = state.pruned ? 1.0 : (state.health / 100);

  // Hydroponic vase bonus
  const vaseBonus = state.plantInVase ? 1.15 : 1.0;

  return lightMultiplier * humMultiplier * outdoorMultiplier * location.growth * fertBoost * healthFactor * vaseBonus * ps.growthMultiplier;
}

function advance(state, seconds) {
  if (seconds <= 0) return state;
  const plant = getPlant(state.plantId);
  const location = getLocation(state.locationId);
  const elapsed = Math.min(seconds, BALANCE.maxOfflineSeconds);
  const hours = elapsed / 3600;

  // Moisture decay: substantially slower in glass water vase
  const dryRate = state.plantInVase
    ? (1.8 / plant.baseWaterDecayRate)
    : (10 / plant.baseWaterDecayRate * location.dryness);

  state.moisture = clamp(state.moisture - dryRate * elapsed, 0, 100);

  // Overwatering root rot (vase roots with pebbles are aerated, immune to soil rot)
  if (!state.plantInVase) {
    if (state.moisture > BALANCE.wetThreshold) state.overwaterSeconds += elapsed;
    else state.overwaterSeconds = Math.max(0, state.overwaterSeconds - elapsed * 2);
  } else {
    state.overwaterSeconds = 0;
  }

  // Chemical stress recovery
  state.chemicalStress = Math.max(0, (state.chemicalStress || 0) - elapsed / 3600 * 0.45);

  // === LEAF BURNING (SCORCH) MECHANICS ===
  const maxSun = plant.sunlightRange[1];
  if (location.sunlight > maxSun) {
    state.sunburnSeconds = (state.sunburnSeconds || 0) + elapsed;
    if (state.sunburnSeconds > 40) {
      state.sunburned = true;
      triggerEmergency(
        state,
        'sunburn',
        'LEAF SCORCH EMERGENCY',
        `The scorching direct light in ${location.name} (${location.sunlight}%) exceeds ${plant.name}'s max tolerance (${maxSun}%)! Move to a shadier room to prevent fatal scorch damage.`
      );
    }
  } else {
    state.sunburnSeconds = Math.max(0, (state.sunburnSeconds || 0) - elapsed * 0.4);
    if (state.sunburnSeconds === 0) {
      resetEmergency(state, 'sunburn');
    }
  }

  // === LIGHT STARVATION (YELLOWING) MECHANICS ===
  const minSun = plant.sunlightRange[0];
  if (location.sunlight < minSun) {
    state.lightStarveSeconds = (state.lightStarveSeconds || 0) + elapsed;
    if (state.lightStarveSeconds > 50) {
      state.lightStarved = true;
      triggerEmergency(
        state,
        'starve',
        'LIGHT STARVATION WARNING',
        `Insufficient light in ${location.name} (${location.sunlight}%)! ${plant.name} requires at least ${minSun}% sun. Foliage is losing chlorophyll and turning yellow.`
      );
    }
  } else {
    state.lightStarveSeconds = Math.max(0, (state.lightStarveSeconds || 0) - elapsed * 0.4);
    if (state.lightStarveSeconds === 0) {
      state.lightStarved = false;
      resetEmergency(state, 'starve');
    }
  }

  // === HEALTH DAMAGE CALCULATION ===
  let damage = 0;
  // Dryness damage
  if (state.moisture < BALANCE.dryThreshold) {
    const drySeverity = (BALANCE.dryThreshold - state.moisture) / BALANCE.dryThreshold;
    damage += drySeverity * BALANCE.healthDecayPerHour * hours;
    if (state.moisture < 5) {
      triggerEmergency(
        state,
        'dryness',
        'CRITICAL DEHYDRATION',
        `The roots of your ${plant.name} are bone dry! Add water immediately.`
      );
    }
  } else {
    resetEmergency(state, 'dryness');
  }

  // Root rot damage
  if (state.overwaterSeconds > 300) {
    damage += BALANCE.rootRotDamagePerHour * plant.overwaterSensitivity * hours;
    triggerEmergency(
      state,
      'rootrot',
      'ROOT ROT HAZARD',
      'The soil has remained completely saturated with water for too long! Roots are suffocating.'
    );
  } else {
    resetEmergency(state, 'rootrot');
  }

  // === ROTTING MECHANICS ===
  if (!state.plantInVase && state.moisture > 88) {
    state.rotSeconds = (state.rotSeconds || 0) + elapsed;
    if (state.rotSeconds > 40) {
      state.rotting = true;
      triggerEmergency(
        state,
        'rot',
        'LEAF & STEM ROT EMERGENCY',
        `Saturated soil has caused fungal rot in the roots and stems of your ${plant.name}! Prune the rotted leaves and let soil dry.`
      );
    }
  } else if (state.moisture < 65) {
    state.rotSeconds = Math.max(0, (state.rotSeconds || 0) - elapsed * 0.4);
  }

  // Rotting health damage
  if (state.rotting) {
    damage += BALANCE.rootRotDamagePerHour * plant.overwaterSensitivity * hours;
  }

  // Sunburn scorch damage
  if (state.sunburned) {
    damage += BALANCE.sunburnDamagePerHour * ((location.sunlight - maxSun) / 30) * hours;
  }

  // Light starvation health decay
  if (state.lightStarved) {
    damage += BALANCE.lightStarveDamagePerHour * hours;
  }

  // Pest damage
  if (state.pests) {
    damage += BALANCE.pestDamagePerHour * hours;
  }

  // Chemical burn damage
  if (state.chemicalStress > 0) {
    damage += BALANCE.chemicalDamagePerHour * state.chemicalStress * hours;
  }

  state.health = clamp(state.health - damage, 0, 100);

  if (state.health <= 0) {
    triggerEmergency(
      state,
      'withered',
      'PLANT WITHERED',
      `Your ${plant.name} has withered due to prolonged adverse conditions. Start a fresh sprout from the top menu.`
    );
  }

  // === GROWTH PROGRESSION ===
  const prevStage = getStage(state);
  state.growth = clamp(state.growth + growthFactor(state, plant, location) * hours * 2.2, 0, 100);
  const newStage = getStage(state);

  if (newStage > prevStage) {
    checkMilestones(state);
  }

  // Pest infestation check
  if (!state.pests) {
    const pestMul = location.isOutdoor ? BALANCE.outdoorPestMultiplier : 1;
    const chance = location.pestRisk * (1 - plant.pestResistance) * hours * pestMul;
    if (Math.random() < chance) {
      state.pests = true;
      log(state, 'Pests have crawled into the foliage!');
      triggerEmergency(
        state,
        'pests',
        'PEST INFESTATION',
        'Pests are nibbling on the leaves! Use Bug Spray to eliminate them.'
      );
    }
  }

  // Outdoor weather update
  updateWeather(state);

  // Weekly supply check
  checkWeeklySupply(state);

  state.lastUpdatedTimestamp = Math.floor(Date.now() / 1000);
  return state;
}

function catchUp(state) {
  checkWeeklySupply(state);
  updateWeather(state);
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - (state.lastUpdatedTimestamp || now);
  return advance(state, elapsed);
}

function care(state, action) {
  const plant = getPlant(state.plantId);
  const currentStage = getStage(state);

  if (state.health <= 0) return 'This plant has withered. Start a new sprout from the menu.';

  if (action === 'water') {
    state.moisture = clamp(state.moisture + ITEMS.water.amount, 0, 100);
    resetEmergency(state, 'dryness');
    log(state, state.plantInVase ? 'Fresh water poured into vase.' : 'Watered the soil.');
    return state.plantInVase ? 'The vase water is replenished.' : 'The soil is refreshed with water.';
  }

  if (action === 'fertilize') {
    if (!state.milestonesFertilized) state.milestonesFertilized = [];

    if (state.milestonesFertilized.includes(currentStage)) {
      return `Already fertilized for this milestone stage (${currentStage + 1}). Wait for the next stage!`;
    }

    if (state.inventory.fertilizer <= 0) {
      return 'No fertilizer remaining. Reach the next growth milestone to earn more!';
    }

    state.inventory.fertilizer--;
    state.milestonesFertilized.push(currentStage);

    const now = Math.floor(Date.now() / 1000);
    state.fertilizerUntil = now + BALANCE.fertilizerDuration;
    log(state, `Fertilizer applied for stage ${currentStage + 1}! +60% growth rate active for 24h.`);
    return `Milestone fertilizer boost applied! Growth rate boosted by +60% for 24 hours.`;
  }

  if (action === 'spray') {
    if (state.inventory.spray <= 0) {
      return 'Out of Bug Spray! A new shipment arrives weekly.';
    }
    state.inventory.spray--;
    state.chemicalStress = (state.chemicalStress || 0) + 1;
    if (state.pests) {
      state.pests = false;
      resetEmergency(state, 'pests');
      log(state, 'Bug spray cleared away all pests.');
      return 'Pests eliminated safely!';
    }
    state.health = clamp(state.health - 4, 0, 100);
    log(state, 'Unnecessary Bug Spray slightly stressed the leaves.');
    return 'Bug Spray applied (no pests were present).';
  }

  if (action === 'prune') {
    const isDamaged = Boolean(state.sunburned || state.rotting || state.health < 65);
    if (!isDamaged) {
      return 'No damaged foliage to prune right now. Prune activates when leaves burn or rot.';
    }
    state.pruned = true;
    state.sunburned = false;
    state.rotting = false;
    state.sunburnSeconds = 0;
    state.rotSeconds = 0;
    resetEmergency(state, 'sunburn');
    resetEmergency(state, 'rot');
    state.health = clamp(state.health + 12, 0, 100);
    log(state, 'Pruned damaged foliage; scorched and rotted leaves removed.');
    return 'Pruning complete. Vigor restored!';
  }

  if (action === 'vase') {
    return toggleVase(state);
  }

  return `Action ${action} executed.`;
}

function toggleVase(state) {
  const plant = getPlant(state.plantId);
  if (!plant.supportsVase) {
    return `${plant.name} roots require breathable soil and cannot grow in a water vase.`;
  }

  state.plantInVase = !state.plantInVase;
  if (state.plantInVase) {
    state.moisture = 90;
    state.overwaterSeconds = 0;
    resetEmergency(state, 'rootrot');
    log(state, `Transferred ${plant.name} into clear glass water vase with river pebbles.`);
    return 'Switched container to Glass Water Vase!';
  } else {
    log(state, `Potted ${plant.name} into terracotta soil.`);
    return 'Switched container to Terracotta Soil Pot.';
  }
}

function changeLocation(state, id) {
  state.locationId = id;
  updateWeather(state);
  const loc = getLocation(id);
  log(state, `Relocated plant to ${loc.name}.`);
}

function getTimeUntilWeeklySupply(state) {
  const now = Math.floor(Date.now() / 1000);
  const next = Number.isFinite(state?.nextWeeklySupplyTime)
    ? state.nextWeeklySupplyTime
    : now + (BALANCE.weeklySupplyInterval || 604800);
  return Math.max(0, next - now);
}

function canPrune(state) {
  return Boolean(state && (state.sunburned || state.rotting || state.health < 65));
}

window.DeskEngine = {
  createState, isValidState, catchUp, care, changeLocation,
  toggleVase, getStage, checkMilestones, getTimeUntilWeeklySupply,
  advance, canPrune
};
})();
