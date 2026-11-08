// ===== Mobile Navigation =====
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
}

toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ===== Header-Schatten beim Scrollen =====
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Öffnungszeiten: heutigen Tag markieren + offen/geschlossen =====
// Index = getDay() (0 = Sonntag). Zeiten in Minuten ab Mitternacht.
const HOURS = {
  0: null,
  1: null,
  2: [600, 1140],
  3: [600, 1140],
  4: [600, 1200],
  5: [600, 1200],
  6: [540, 960],
};

// Uhrzeit immer in Berliner Zeit, egal wo der Besucher ist
function berlinNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const { day, minutes } = berlinNow();
const todayRow = document.querySelector(`.hours tr[data-day="${day}"]`);
if (todayRow) todayRow.classList.add("is-today");

const status = document.getElementById("open-status");
const today = HOURS[day];
const isOpen = today && minutes >= today[0] && minutes < today[1];
status.textContent = isOpen ? "Jetzt geöffnet" : "Gerade geschlossen";
status.classList.add(isOpen ? "is-open" : "is-closed");

// ===== Kontaktformular (nur Frontend) =====
const form = document.getElementById("contact-form");
const success = document.getElementById("form-success");

const validators = {
  name: (v) => (v.trim().length >= 2 ? "" : "Bitte gib deinen Namen ein."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Bitte gib eine gültige E-Mail-Adresse ein."),
  phone: (v) => (v.trim() === "" || /^[+\d][\d\s/()-]{5,}$/.test(v.trim()) ? "" : "Bitte gib eine gültige Telefonnummer ein."),
  service: (v) => (v ? "" : "Bitte wähle eine Leistung."),
};

function validateField(input) {
  const check = validators[input.name];
  if (!check) return true;
  const msg = check(input.value);
  const field = input.closest(".field");
  field.classList.toggle("has-error", Boolean(msg));
  field.querySelector(".error").textContent = msg;
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}

function validatePrivacy() {
  const box = form.elements.privacy;
  const msg = box.checked ? "" : "Bitte stimme der Datenverarbeitung zu.";
  document.getElementById("privacy-error").textContent = msg;
  return !msg;
}

// Fehler erst nach dem ersten Verlassen eines Feldes anzeigen, danach live
Object.keys(validators).forEach((name) => {
  const input = form.elements[name];
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("has-error")) validateField(input);
  });
});
form.elements.privacy.addEventListener("change", validatePrivacy);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const results = Object.keys(validators).map((name) => validateField(form.elements[name]));
  const privacyOk = validatePrivacy();

  if (results.every(Boolean) && privacyOk) {
    // Hier würde später der Versand an ein Backend passieren.
    form.reset();
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    success.hidden = true;
    const firstError = form.querySelector('[aria-invalid="true"]');
    if (firstError) firstError.focus();
  }
});

// ===== Jahr im Footer =====
document.getElementById("year").textContent = new Date().getFullYear();
