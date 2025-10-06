window.onload = function() {
  populateDropdowns();
};

function populateDropdowns() {
  const stageSelect = document.getElementById("INPUT_STAGE");
  for (let i = 1; i <= 17; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    stageSelect.appendChild(opt);
  }

  const levelSelect = document.getElementById("INPUT_LEVEL");
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
}

function log(msg) {
  document.getElementById("output").textContent += msg + "\n";
}

function calculate() {
  document.getElementById("output").textContent = "";

  // Inputs
  const INPUT_VIP_BONUS_ = document.getElementById("VIP_BONUS_").checked;
  const BONUS_MULTIPLIER = INPUT_VIP_BONUS_ ? 1.05 : 1.0;
  const INPUT_TWITCH_REWARDS_ = document.getElementById("TWITCH_REWARDS_").checked;

  const INPUT_STAGE = parseInt(document.getElementById("INPUT_STAGE").value);
  const INPUT_LEVEL = document.getElementById("INPUT_LEVEL").value;
  const INPUT_DIFFICULTY = document.getElementById("INPUT_DIFFICULTY").value;

  const INPUT_ESSENCE_PER_VIDEO_CHEST = parseFloat(document.getElementById("INPUT_ESSENCE_PER_VIDEO_CHEST").value);
  const INPUT_BONUS_ESSENCE_RATE = parseFloat(document.getElementById("INPUT_BONUS_ESSENCE_RATE").value);
  const INPUT_STATIC_BONUS_ESSENCE_GUILD_HUNT = parseFloat(document.getElementById("INPUT_STATIC_BONUS_ESSENCE_GUILD_HUNT").value);
  const TARGET_ESSENCE = parseFloat(document.getElementById("TARGET_ESSENCE").value);

  if (!INPUT_STAGE || !INPUT_LEVEL || !INPUT_DIFFICULTY) {
    log("Please select Stage, Level, and Difficulty.");
    return;
  }

  // --- Data ---
  const essence_data = {
    17: { Easy: { num: 70, b: 75 }, Medium: { num: 77, b: 82 }, Hard: { num: 85, b: 90 } },
    16: { Easy: { num: 65, b: 71 }, Medium: { num: 71, b: 77 }, Hard: { num: 80, b: 85 } }
  };
  const rate_data = { "1-4": 0.65, "5-8": 0.7, "9-10": 0.8, b: 0.65 };

  function get_essence_value(stage, level, difficulty) {
    let base_essence, rate;
    if (["b1", "b2"].includes(level.toLowerCase())) {
      base_essence = essence_data[stage][difficulty]["b"];
      rate = rate_data["b"];
    } else {
      base_essence = essence_data[stage][difficulty]["num"];
      const lvl = parseInt(level);
      if (lvl >= 1 && lvl <= 4) rate = rate_data["1-4"];
      else if (lvl >= 5 && lvl <= 8) rate = rate_data["5-8"];
      else rate = rate_data["9-10"];
    }
    return base_essence * BONUS_MULTIPLIER * rate;
  }

  const ESSENCE_PER_LEVEL = get_essence_value(INPUT_STAGE, INPUT_LEVEL, INPUT_DIFFICULTY);
  log(`Essence rate is set to ${ESSENCE_PER_LEVEL.toFixed(2)} average for ${INPUT_STAGE}-${INPUT_LEVEL} on ${INPUT_DIFFICULTY}`);

  // Video ads
  const VIDEO_AD_CHESTS_LIMIT_PER_DAY = 5;
  const CHANCE_OF_ESSENCE_PER_VIDEO_CHEST = 0.5;
  const VIDEO_ADS_BONUS_ESSENCE_DAILY =
    VIDEO_AD_CHESTS_LIMIT_PER_DAY * INPUT_ESSENCE_PER_VIDEO_CHEST * CHANCE_OF_ESSENCE_PER_VIDEO_CHEST;

  // Beer / Keys / Essence setup
  const beer_per_hour = 5, hours_in_day = 24;
  const base_beer_per_day = beer_per_hour * hours_in_day;
  const regular_store_beer_daily = 20;
  const arena_store_beer_weekly = 5 * 25;
  const guild_store_beer_weekly = 10 * 2;
  const bonus_beer_daily = 10;
  const resource_store_beer_daily = 60;

  const base_keys_per_day = 24;
  const guild_store_keys_weekly = 3 * 6;
  const regular_store_keys_daily = 2 * 3;
  const resource_store_keys_daily = 4;

  const regular_store_essence_daily = 100;
  const bonus_essence_daily = 120;
  const guild_store_weekly_essence = 2 * 100;

  const beer_total_daily =
    base_beer_per_day + regular_store_beer_daily + bonus_beer_daily + resource_store_beer_daily;

  const keys_per_week =
    (base_keys_per_day + regular_store_keys_daily + resource_store_keys_daily) * 7 + guild_store_keys_weekly;
  log(`Keys per week : ${keys_per_week}. (${((base_keys_per_day + regular_store_keys_daily + resource_store_keys_daily) * 7)} daily, plus ${guild_store_keys_weekly} from guild store)`);

  const beer_per_week =
    (beer_total_daily * 7) + guild_store_beer_weekly + arena_store_beer_weekly;

  let essence_purchased_per_week =
    ((regular_store_essence_daily + bonus_essence_daily + VIDEO_ADS_BONUS_ESSENCE_DAILY) * 7) +
    guild_store_weekly_essence;

  // Guild Hunt Essence
  const ELEMENTAL_80_ = true,
        ELEMENTAL_160_ = true,
        EQUINOX_80_ = true,
        EQUINOX_160_ = true,
        STARBREAKER_80_ = true,
        STARBREAKER_160_ = true;

  let guilt_hunt_essence_weekly = 0;
  if (ELEMENTAL_80_) guilt_hunt_essence_weekly += 150;
  if (ELEMENTAL_160_) guilt_hunt_essence_weekly += 300;
  if (EQUINOX_80_) guilt_hunt_essence_weekly += 150;
  if (EQUINOX_160_) guilt_hunt_essence_weekly += 300;
  if (STARBREAKER_80_) guilt_hunt_essence_weekly += 150;
  if (STARBREAKER_160_) guilt_hunt_essence_weekly += 300;

  guilt_hunt_essence_weekly += INPUT_STATIC_BONUS_ESSENCE_GUILD_HUNT;
  log(`Guild hunt streak bonuses added to weekly : ${guilt_hunt_essence_weekly}`);
  essence_purchased_per_week += guilt_hunt_essence_weekly;
  log(`Updated essence per week (purchased+guild hunt) : ${essence_purchased_per_week}`);

  // Bonus week calculation
  const ONE_DAY_BEER = beer_total_daily;
  const SAVEABLE_BEER = 60 + regular_store_beer_daily + bonus_beer_daily + resource_store_beer_daily;
  const BEER_USABLE_ON_BONUS_DAY = ONE_DAY_BEER + SAVEABLE_BEER;

  const five_day_earned_essence = (beer_total_daily / 6) * ESSENCE_PER_LEVEL;
  const partial_day_earned_essence = (beer_total_daily - SAVEABLE_BEER) / 6 * ESSENCE_PER_LEVEL;
  const bonus_day_earned_essence =
    (beer_total_daily + SAVEABLE_BEER + arena_store_beer_weekly + guild_store_beer_weekly) /
    6 * ESSENCE_PER_LEVEL * (1 + INPUT_BONUS_ESSENCE_RATE);

  log(`Five days no bonuses earned ${five_day_earned_essence.toFixed(2)} a day, for ${(five_day_earned_essence * 5).toFixed(2)}`);
  log(`Light day prepping for bonus earns : ${partial_day_earned_essence.toFixed(2)}`);
  log(`Bonus day @${INPUT_BONUS_ESSENCE_RATE} : ${bonus_day_earned_essence.toFixed(2)}`);

  const total_essence_on_bonus_week =
    (five_day_earned_essence * 5) + partial_day_earned_essence + bonus_day_earned_essence;

  log(`Purchasable essence per week : ${essence_purchased_per_week.toFixed(2)}`);
  const total_essence_on_bonus_week_with_purchase =
    total_essence_on_bonus_week + essence_purchased_per_week;
  log(`\n---\nTotal Essence on bonus week of ${INPUT_BONUS_ESSENCE_RATE} : ${total_essence_on_bonus_week_with_purchase.toFixed(2)}`);
  log(`Average Daily : ${(total_essence_on_bonus_week_with_purchase / 7).toFixed(2)}`);

  const WEEKS_TO_TARGET = TARGET_ESSENCE / total_essence_on_bonus_week_with_purchase;
  log(`Weeks to target essence : ${WEEKS_TO_TARGET.toFixed(2)}`);
}
