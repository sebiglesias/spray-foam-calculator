// Spray Foam Insulation & Board Feet Calculator Engine
const state = {
  areaSqFt: 450,
  thicknessInches: 2.0,
  foamType: "closed", // "closed" (R-7.0/in) or "open" (R-3.8/in)
  wasteBufferPct: 10
};

const presets = {
  van: {
    name: "Sprinter / Camper Van (350 sq ft, 2\" Closed-Cell)",
    area: 350,
    thickness: 2.0,
    type: "closed"
  },
  garage: {
    name: "2-Car Garage Ceiling (450 sq ft, 2\" Closed-Cell)",
    area: 450,
    thickness: 2.0,
    type: "closed"
  },
  rim_joists: {
    name: "Basement Rim Joists (180 sq ft, 3\" Closed-Cell)",
    area: 180,
    thickness: 3.0,
    type: "closed"
  },
  pole_barn: {
    name: "Pole Barn Roof (1,500 sq ft, 2\" Closed-Cell)",
    area: 1500,
    thickness: 2.0,
    type: "closed"
  }
};

function init() {
  attachEventListeners();
  applyPreset("garage");
  calculate();
}

function attachEventListeners() {
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyPreset(btn.dataset.preset);
    });
  });

  const areaInput = document.getElementById("areaSqFt");
  const thickInput = document.getElementById("thicknessInches");
  const typeSelect = document.getElementById("foamType");
  const wasteSelect = document.getElementById("wasteBuffer");

  areaInput.addEventListener("input", (e) => {
    state.areaSqFt = parseFloat(e.target.value) || 0;
    calculate();
  });

  thickInput.addEventListener("input", (e) => {
    state.thicknessInches = parseFloat(e.target.value) || 0;
    calculate();
  });

  typeSelect.addEventListener("change", (e) => {
    state.foamType = e.target.value;
    calculate();
  });

  wasteSelect.addEventListener("change", (e) => {
    state.wasteBufferPct = parseFloat(e.target.value) || 10;
    calculate();
  });
}

function applyPreset(key) {
  const p = presets[key];
  if (!p) return;
  state.areaSqFt = p.area;
  state.thicknessInches = p.thickness;
  state.foamType = p.type;

  document.getElementById("areaSqFt").value = p.area;
  document.getElementById("thicknessInches").value = p.thickness;
  document.getElementById("foamType").value = p.type;

  calculate();
}

function calculate() {
  const area = state.areaSqFt;
  const thick = state.thicknessInches;
  const buffer = 1 + (state.wasteBufferPct / 100);

  if (area <= 0 || thick <= 0) {
    document.getElementById("boardFeetResult").textContent = "—";
    return;
  }

  // 1 Board Foot = 1 ft² at 1" thickness
  const rawBoardFeet = area * thick;
  const totalBoardFeet = Math.round(rawBoardFeet * buffer);

  // R-Value
  const rPerInch = state.foamType === "closed" ? 7.0 : 3.8;
  const totalRValue = Math.round(thick * rPerInch);

  // Kits needed
  const kits600 = Math.ceil(totalBoardFeet / 600);
  const kits200 = Math.ceil(totalBoardFeet / 200);

  // Estimated costs
  const diyCost = totalBoardFeet * 1.15; // ~$1.15 / board-foot for 600 kits
  const proCost = totalBoardFeet * 2.10; // ~$2.10 / board-foot contractor installed

  // Update UI
  document.getElementById("boardFeetResult").textContent = totalBoardFeet.toLocaleString("en-US");
  document.getElementById("rValueResult").textContent = "R-" + totalRValue + " (" + (state.foamType === "closed" ? "Closed-Cell" : "Open-Cell") + ")";
  document.getElementById("kits600Result").textContent = kits600 + (kits600 === 1 ? " Kit" : " Kits") + " (600 bd-ft)";
  document.getElementById("kits200Result").textContent = kits200 + (kits200 === 1 ? " Kit" : " Kits") + " (200 bd-ft)";
  document.getElementById("costEstResult").textContent = "$" + Math.round(diyCost).toLocaleString("en-US") + " (vs $" + Math.round(proCost).toLocaleString("en-US") + " Pro)";
  document.getElementById("vaporResult").textContent = state.foamType === "closed" && thick >= 2.0 ? "Yes (Class II Vapor Retarder)" : "No (Requires separate barrier)";
}

window.addEventListener("DOMContentLoaded", init);
