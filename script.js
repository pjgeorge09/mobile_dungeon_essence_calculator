window.onload = function() {
  populateDropdowns();
};

function populateDropdowns() {
  // Farming Stage (1–17)
  const farmingStage = document.getElementById("farming_stage");
  for (let i = 1; i <= 17; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    farmingStage.appendChild(opt);
  }

  // Level (1–10 + b1, b2)
  const levelSelect = document.getElementById("level");
  for (let i = 1; i <= 10; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    levelSelect.appendChild(opt);
  }
  ["b1", "b2"].forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l.toUpperCase();
    levelSelect.appendChild(opt);
  });

  // Streaks (20–200 by 20)
  const streakValues = Array.from({ length: 10 }, (_, i) => (i + 1) * 20);
  ["elemental_streak", "equinox_streak", "starbreaker_streak"].forEach(id => {
    const select = document.getElementById(id);
    streakValues.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  });
}

function calculate() {
  const vipBonus = document.getElementById("vip_bonus").checked ? 1.05 : 1.0;
  const twitchBonus = document.getElementById("twitch_rewards").checked ? 1.10 : 1.0;
  const farmingStage = parseInt(document.getElementById("farming_stage").value);
  const level = document.getElementById("level").value;
  const difficulty = document.getElementById("difficulty").value;
  const essencePerVideo = parseFloat(document.getElementById("essence_per_video").value) || 0;
  const elementalStreak = parseInt(document.getElementById("elemental_streak").value);
  const equinoxStreak = parseInt(document.getElementById("equinox_streak").value);
  const starbreakerStreak = parseInt(document.getElementById("starbreaker_streak").value);
  const guildBonus = parseFloat(document.getElementById("guild_bonus").value) || 0;
  const bonusRate = parseFloat(document.getElementById("bonus_rate").value);
  const target = parseFloat(document.getElementById("target").value) || 0;

  if (!farmingStage || !level || !difficulty) {
    alert("Please select Farming Stage, Level, and Difficulty.");
    return;
  }

  // Placeholder base values
  const ESSENCE_PER_LEVEL = getEssencePerLevel(farmingStage, difficulty);
  const CURRENT_LEVEL_RATE = getCurrentLevelRate(level, difficulty);

  const streakBonus = (elementalStreak + equinoxStreak + starbreakerStreak) / 1000;
  const baseEssence = ESSENCE_PER_LEVEL * CURRENT_LEVEL_RATE;
  const total =
    (baseEssence + guildBonus + essencePerVideo) *
    vipBonus *
    twitchBonus *
    (1 + bonusRate) *
    (1 + streakBonus);

  const result = target ? `${total.toFixed(2)} / Target: ${target}` : total.toFixed(2);
  document.getElementById("result").textContent = result;
}

function getEssencePerLevel(stage, difficulty) {
  const base = { Easy: 80, Medium: 120, Hard: 160 }[difficulty] || 0;
  return base + stage * 2;
}

function getCurrentLevelRate(level, difficulty) {
  const diffMult = { Easy: 1.0, Medium: 1.15, Hard: 1.3 }[difficulty] || 1.0;
  const levelNum = isNaN(level) ? 11 : parseInt(level);
  return levelNum * 0.1 * diffMult;
}
