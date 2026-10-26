(() => {
/** DeskSprout v3 Configuration — Species, Locations, Playstyles & Controls */

const PLANTS = [
  {
    id: 'dracaena',
    name: 'Lucky Bamboo',
    scientific: 'Dracaena sanderiana',
    description: 'An elegant tropical cane with calm arching leaves. Thrives in moderate indirect light and loves water.',
    optimalSunlight: 40,
    sunlightRange: [22, 58], // Below 22 = yellowing, above 58 = leaf scorch
    optimalHumidity: 60,
    humidityRange: [35, 90],
    baseWaterDecayRate: 1500,
    pestResistance: 0.65,
    overwaterSensitivity: 0.4,
    supportsVase: true,
    growthStages: ['cutting', 'cane', 'shoots', 'grove'],
    outdoorAffinity: -0.2, // Sensitive to outdoor temperature swings and harsh drafts
    palette: ['#1c4028', '#2b6e3b', '#48a855', '#8cee68', '#f0fec8', '#142c1c'],
    accentColor: '#48a855',
    realisticDaysToMature: 240
  },
  {
    id: 'cactus',
    name: 'Desert Cactus',
    scientific: 'Echinopsis calochlora',
    description: 'A sun-worshipping desert survivor. Needs intense direct sun and dry roots. Low light causes severe yellowing.',
    optimalSunlight: 90,
    sunlightRange: [65, 100], // Below 65 = severe light starvation/yellowing; immune to scorch
    optimalHumidity: 25,
    humidityRange: [10, 45], // Above 45 = high fungal/rot risk
    baseWaterDecayRate: 3800,
    pestResistance: 0.88,
    overwaterSensitivity: 1.8,
    supportsVase: false,
    growthStages: ['seed', 'bud', 'tower', 'bloom'],
    outdoorAffinity: 0.4, // Loves warm dry outdoor sun and breeze
    palette: ['#354e28', '#4b7536', '#72a84a', '#a6d962', '#f6e47a', '#24361b'],
    accentColor: '#f6e47a',
    realisticDaysToMature: 365
  },
  {
    id: 'pothos',
    name: 'Golden Pothos',
    scientific: 'Epipremnum aureum',
    description: 'A resilient vine with heart-shaped leaves marbled in cream. Highly adaptable, but harsh direct rays bleach leaves.',
    optimalSunlight: 50,
    sunlightRange: [25, 72], // Above 72 = leaf bleach/burn
    optimalHumidity: 55,
    humidityRange: [30, 85],
    baseWaterDecayRate: 1800,
    pestResistance: 0.6,
    overwaterSensitivity: 0.85,
    supportsVase: true,
    growthStages: ['cutting', 'leaf', 'vine', 'cascade'],
    outdoorAffinity: 0.1, // Tolerant indoors or sheltered outdoors
    palette: ['#284e2a', '#3f7836', '#69ab45', '#a4d957', '#faecd0', '#1c381e'],
    accentColor: '#a4d957',
    realisticDaysToMature: 120
  },
  {
    id: 'fern',
    name: 'Mist Fern',
    scientific: 'Nephrolepis exaltata',
    description: 'Feather-light arching fronds from shady humid forest floors. Direct sunlight burns its fronds within hours.',
    optimalSunlight: 25,
    sunlightRange: [14, 42], // Above 42 = severe frond burn!
    optimalHumidity: 82,
    humidityRange: [60, 100], // Below 60 = dry crispy edges
    baseWaterDecayRate: 950,
    pestResistance: 0.3,
    overwaterSensitivity: 0.55,
    supportsVase: false,
    growthStages: ['spore', 'shoot', 'fronds', 'lush'],
    outdoorAffinity: 0.15, // Loves humid shaded gardens; hates dry indoor A/C
    palette: ['#22441f', '#356a2e', '#559c40', '#88d259', '#e0f6b4', '#173015'],
    accentColor: '#88d259',
    realisticDaysToMature: 180
  },
  {
    id: 'lily',
    name: 'Peace Lily',
    scientific: 'Spathiphyllum wallisii',
    description: 'Glossy dark leaves and pure white spathes. Adapted to rainforest gloom; scorched by window sun.',
    optimalSunlight: 30,
    sunlightRange: [16, 46], // Above 46 = scorched white spathe and leaf margins
    optimalHumidity: 78,
    humidityRange: [50, 95], // Below 50 = wilting leaf tips
    baseWaterDecayRate: 1100,
    pestResistance: 0.4,
    overwaterSensitivity: 0.75,
    supportsVase: true,
    growthStages: ['sprout', 'leaves', 'bud', 'bloom'],
    outdoorAffinity: -0.25, // Cold/wind sensitive, prefers warm humid interior
    palette: ['#18442e', '#246b45', '#3ea662', '#7dd884', '#fff9de', '#113020'],
    accentColor: '#fff9de',
    realisticDaysToMature: 210
  },
  {
    id: 'snake',
    name: 'Snake Plant',
    scientific: 'Sansevieria trifasciata',
    description: 'Tough upright sword blades bordered in golden cream. Tolerates neglect and shade, but suffers in soggy soil.',
    optimalSunlight: 50,
    sunlightRange: [20, 82],
    optimalHumidity: 35,
    humidityRange: [15, 65], // Above 65 in wet soil = root rot risk
    baseWaterDecayRate: 4400,
    pestResistance: 0.92,
    overwaterSensitivity: 1.65,
    supportsVase: false,
    growthStages: ['pup', 'blade', 'cluster', 'crown'],
    outdoorAffinity: 0.1,
    palette: ['#1a3a29', '#2c6343', '#4a995e', '#8fd27a', '#eae6a6', '#12291d'],
    accentColor: '#8fd27a',
    realisticDaysToMature: 300
  }
];

const LOCATIONS = [
  {
    id: 'window',
    name: 'Desk Window',
    sunlight: 88, // Scorching direct light
    humidity: 42,
    dryness: 1.25,
    growth: 1.4,
    pestRisk: 0.08,
    isOutdoor: false,
    tempLabel: '27°C · Bright & Warm',
    description: 'Direct sunbeam exposure. High scorch hazard for ferns and lilies.'
  },
  {
    id: 'computer',
    name: 'Computer Table',
    sunlight: 24, // Dim indirect artificial glow
    humidity: 32,
    dryness: 1.2,
    growth: 0.8,
    pestRisk: 0.05,
    isOutdoor: false,
    tempLabel: '22°C · Ambient Tech',
    description: 'Soft monitor light. Safe from sunburn, but cactus will yellow and starve.'
  },
  {
    id: 'bathroom',
    name: 'Bathroom Counter',
    sunlight: 18, // Very dim diffused light
    humidity: 92, // Steamy high humidity
    dryness: 0.65,
    growth: 0.6,
    pestRisk: 0.3,
    isOutdoor: false,
    tempLabel: '24°C · Warm & Steamy',
    description: 'Rich steam humidity. Paradise for Mist Ferns; lethal damp rot for Cactus.'
  },
  {
    id: 'garden',
    name: 'Shaded Garden',
    sunlight: 68, // Natural dappled outdoor sun
    humidity: 74,
    dryness: 0.85,
    growth: 1.7,
    pestRisk: 0.32,
    isOutdoor: true,
    weather: { rainChance: 0.35, windRange: [4, 18], tempRange: [18, 30] },
    tempLabel: 'Outdoor · Living Weather',
    description: 'Living soil and breeze. Boosts outdoor-loving plants, but outdoor pests linger.'
  },
  {
    id: 'greenhouse',
    name: 'Mini Greenhouse',
    sunlight: 62, // Filtered glass sunshine
    humidity: 84, // Trapped moist air
    dryness: 0.6,
    growth: 1.65,
    pestRisk: 0.16,
    isOutdoor: false,
    tempLabel: '28°C · Tropical Heat',
    description: 'Steamy glass enclosure. Supercharges tropical vines and bamboo.'
  },
  {
    id: 'ac-room',
    name: 'A/C Room',
    sunlight: 46, // Cool filtered light
    humidity: 18, // Very dry air conditioning
    dryness: 1.85, // Dries soil rapidly
    growth: 0.95,
    pestRisk: 0.06,
    isOutdoor: false,
    tempLabel: '19°C · Cold Dry Airflow',
    description: 'Rapid moisture evaporation and cold drafts. Stresses high-humidity plants.'
  }
];

const PLAYSTYLES = [
  {
    id: 'fast',
    name: 'Fast-Paced',
    icon: '⚡',
    description: 'Rapid growth in real-time minutes. Ideal for testing and active play.',
    growthMultiplier: 1.0,
    paceLabel: '~15-30 minutes to full bloom'
  },
  {
    id: 'arcade',
    name: 'Arcade',
    icon: '🕹️',
    description: 'Takes about 1 week on average for full maturity. A balanced daily desk companion.',
    growthMultiplier: 0.05,
    paceLabel: '~7 days average to full bloom'
  },
  {
    id: 'realistic',
    name: 'Realistic',
    icon: '🌱',
    description: 'Reflects real-life botanical pace and delicate balance. True gardening patience.',
    growthMultiplier: 0.0035,
    paceLabel: 'Months of genuine natural growth'
  }
];

const START_TYPES = [
  {
    id: 'seed',
    name: 'Fresh Seed',
    description: 'Start from scratch with a seed resting in fertile ground. Experience the full lifecycle.',
    startGrowth: 0,
    badge: 'Stage 1 · Seed'
  },
  {
    id: 'bud',
    name: 'Young Bud',
    description: 'Skip initial dormancy. Begin with an eager young bud with early tender leaves.',
    startGrowth: 26,
    badge: 'Stage 2 · Budding'
  }
];

const ITEMS = {
  water: { name: 'Water', amount: 30, icon: '💧', key: 'W' },
  fertilizer: { name: 'Fertilizer', amount: 1, max: 4, icon: '🧪', key: 'F' },
  spray: { name: 'Bug Spray', amount: 1, max: 5, icon: '🛡️', key: 'B' },
  shears: { name: 'Shears', amount: 1, max: 1, icon: '✂️', key: 'P' }
};

const BALANCE = {
  maxOfflineSeconds: 60 * 60 * 24 * 30,
  healthDecayPerHour: 10,
  pestDamagePerHour: 7,
  rootRotDamagePerHour: 14,
  chemicalDamagePerHour: 3,
  sunburnDamagePerHour: 16,
  lightStarveDamagePerHour: 6,
  dryThreshold: 15,
  wetThreshold: 95,
  fertilizerDuration: 86400,
  fertilizerBoost: 0.6, // +60% growth rate boost
  weeklySupplyInterval: 604800,
  saveInterval: 10000,
  logLimit: 40,
  outdoorPestMultiplier: 1.5,
  weatherChangeInterval: 180
};

const KEYBOARD = {
  'w': 'water', 'W': 'water',
  'f': 'fertilize', 'F': 'fertilize',
  'b': 'spray', 'B': 'spray', 's': 'spray', 'S': 'spray',
  'p': 'prune', 'P': 'prune',
  'v': 'vase', 'V': 'vase',
  't': 'theme', 'T': 'theme',
  'n': 'newPlant', 'N': 'newPlant',
  'e': 'export', 'E': 'export'
};

const getPlant = id => PLANTS.find(p => p.id === id) || PLANTS[0];
const getLocation = id => LOCATIONS.find(l => l.id === id) || LOCATIONS[0];
const getPlaystyle = id => PLAYSTYLES.find(p => p.id === id) || PLAYSTYLES[0];
const getStartType = id => START_TYPES.find(s => s.id === id) || START_TYPES[0];

window.DeskConfig = {
  PLANTS, LOCATIONS, PLAYSTYLES, START_TYPES, ITEMS, BALANCE, KEYBOARD,
  getPlant, getLocation, getPlaystyle, getStartType
};
})();
