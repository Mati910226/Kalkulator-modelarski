let tryb = Number(localStorage.getItem("ostatniTrybKalkulatorModelarski")) || 1;
let podtrybNachylenie = Number(localStorage.getItem("podtrybNachylenieKalkulatorModelarski")) || 1;
let aktualnyWynik = "0.00000000";
let aktualnaJednostka = "°";
let skurcz4 = 1;
let kierunek4 = "pow";
let historia = JSON.parse(localStorage.getItem("historiaKalkulatorModelarskiV12")) || [];
let autoKopiowanie = localStorage.getItem("autoKopiowanieKalkulatorModelarski") !== "false";
let aktualnyMotyw = localStorage.getItem("motywKalkulatorModelarski") || "dark";

const MSG_READY = "Narzędzie gotowe do obliczeń.";
const MSG_SAVED = "Dane zapisane w historii.";
const MSG_COPIED = "Wynik skopiowany do schowka.";
const MSG_CLEARED = "Wszystkie pola zostały wyczyszczone.";
const MSG_MISSING = "Uzupełnij wszystkie wymagane pola.";
const MSG_INVALID = "Wprowadzono nieprawidłowe dane.";

function n(value) {
    return parseFloat(String(value).replace(",", "."));
}

function deg(value) {
    return value * Math.PI / 180;
}

function rad(value) {
    return value * 180 / Math.PI;
}

function format8(value) {
    if (!isFinite(value)) return "0.00000000";
    return Number(value).toFixed(8);
}

function setStatus(text) {
    document.getElementById("status").textContent = text || "Kalkulator gotowy.";
}

function setDetails(text) {
    document.getElementById("details").innerHTML = text;
}

let toastTimer;
function toast(text) {
    const el = document.getElementById("toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1300);
}

function flashResult() {
    const box = document.querySelector(".result");
    if (!box) return;
    box.classList.remove("flash");
    void box.offsetWidth;
    box.classList.add("flash");
}

function showOverlay() {
    document.getElementById("overlay").classList.add("show");
}

function hideOverlay() {
    document.getElementById("overlay").classList.remove("show");
}

function zamknijPanele() {
    document.getElementById("historyDrawer").classList.remove("open");
    document.getElementById("settingsDrawer").classList.remove("open");
    hideOverlay();
}

function toggleHistoria() {
    const h = document.getElementById("historyDrawer");
    const s = document.getElementById("settingsDrawer");
    const willOpen = !h.classList.contains("open");
    s.classList.remove("open");
    h.classList.toggle("open", willOpen);
    willOpen ? showOverlay() : hideOverlay();
}

function toggleUstawienia() {
    const h = document.getElementById("historyDrawer");
    const s = document.getElementById("settingsDrawer");
    const willOpen = !s.classList.contains("open");
    h.classList.remove("open");
    s.classList.toggle("open", willOpen);
    willOpen ? showOverlay() : hideOverlay();
}

function zmienTryb(t) {
    tryb = t;
    localStorage.setItem("ostatniTrybKalkulatorModelarski", String(t));

    document.querySelectorAll(".nav-btn").forEach((b, i) => b.classList.toggle("active", i + 1 === t));
    document.querySelectorAll(".mode").forEach((m, i) => m.classList.toggle("active", i + 1 === t));

    aktualnyWynik = "0.00000000";
    document.getElementById("wynik").textContent = "0.00000000";
    setStatus("Zmieniono tryb.");
    setDetails(MSG_READY);
    updateUnit();

    const first = document.querySelector(".mode.active input");
    if (first) first.focus();
}

function updateUnit() {
    const unit = document.getElementById("unit");
    if (tryb === 1) unit.textContent = "°";
    if (tryb === 2) unit.textContent = "°";
    if (tryb === 3) {
        unit.textContent = podtrybNachylenie === 1 || podtrybNachylenie === 3 ? "%" : (podtrybNachylenie === 2 ? "°" : "mm");
    }
    if (tryb === 4) unit.textContent = "mm";
    if (tryb === 5) unit.textContent = "mm";
    if (tryb === 6) unit.textContent = "mm";
}

function ustawNachylenie(t) {
    podtrybNachylenie = t;
    localStorage.setItem("podtrybNachylenieKalkulatorModelarski", String(t));

    document.querySelectorAll("#mode3 .submode").forEach((el, i) => el.classList.toggle("active", i + 1 === t));
    document.querySelectorAll("#mode3 .choice-btn").forEach((el, i) => el.classList.toggle("active", i + 1 === t));

    aktualnyWynik = "0.00000000";
    document.getElementById("wynik").textContent = "0.00000000";
    updateUnit();
    setDetails(MSG_READY);

    const first = document.querySelector("#mode3 .submode.active input");
    if (first) first.focus();
}

function oblicz() {
    if (tryb === 1) calc1();
    if (tryb === 2) calc2();
    if (tryb === 3) calc3();
    if (tryb === 4) calc4();
    if (tryb === 5) calc5();
    if (tryb === 6) calc6();
}

function setResult(value, unit, name, data) {
    aktualnyWynik = format8(value);
    aktualnaJednostka = unit;

    document.getElementById("wynik").textContent = aktualnyWynik;
    document.getElementById("unit").textContent = unit;
    setDetails(MSG_SAVED);
    flashResult();

    historia.unshift({
        czas: new Date().toLocaleTimeString("pl-PL"),
        nazwa: name,
        wynik: aktualnyWynik,
        jednostka: unit,
        dane: data
    });

    historia = historia.slice(0, 100);
    saveHist();

    if (autoKopiowanie) {
        kopiuj();
        setStatus("Wynik obliczony i skopiowany.");
    } else {
        setStatus("Wynik obliczony.");
        toast("Wynik obliczony");
    }
}

function blad(text = MSG_INVALID) {
    setStatus(text);
    setDetails(text);
    toast(text);
}

function requireNumbers(values) {
    return values.every(v => !isNaN(v));
}

function calc1() {
    const A = n(document.getElementById("a1").value);
    const B = n(document.getElementById("b1").value);
    if (!requireNumbers([A, B])) return blad(MSG_MISSING);
    if (B === 0) return blad(MSG_INVALID);

    setResult(rad(Math.atan(A / B)), "°", "Wyliczanie kąta", `A=${A} mm<br>B=${B} mm`);
}

function calc2() {
    const A = n(document.getElementById("a2").value);
    const alfa = n(document.getElementById("alfa2").value);
    const B = n(document.getElementById("b2").value);
    if (!requireNumbers([A, alfa, B])) return blad(MSG_MISSING);
    if (B === 0) return blad(MSG_INVALID);

    const przes = A * Math.tan(deg(alfa));
    const beta = rad(Math.atan(przes / B));
    setResult(beta, "°", "Wyliczanie kąta β", `A=${A} mm<br>α=${alfa}°<br>B=${B} mm`);
}

function calc3() {
    if (podtrybNachylenie === 1) {
        const A = n(document.getElementById("nA").value);
        const B = n(document.getElementById("nB").value);
        if (!requireNumbers([A, B])) return blad(MSG_MISSING);
        if (B === 0) return blad(MSG_INVALID);
        setResult((A / B) * 100, "%", "Przelicznik nachylenia", `A=${A} mm<br>B=${B} mm`);
    }

    if (podtrybNachylenie === 2) {
        const p = n(document.getElementById("nProc").value);
        if (!requireNumbers([p])) return blad(MSG_MISSING);
        setResult(rad(Math.atan(p / 100)), "°", "Przelicznik nachylenia", `Nachylenie=${p}%`);
    }

    if (podtrybNachylenie === 3) {
        const k = n(document.getElementById("nKat").value);
        if (!requireNumbers([k])) return blad(MSG_MISSING);
        setResult(Math.tan(deg(k)) * 100, "%", "Przelicznik nachylenia", `Kąt=${k}°`);
    }

    if (podtrybNachylenie === 4) {
        const p = n(document.getElementById("nProc2").value);
        const h = n(document.getElementById("nWys").value);
        if (!requireNumbers([p, h])) return blad(MSG_MISSING);
        setResult(h * p / 100, "mm", "Przelicznik nachylenia", `Nachylenie=${p}%<br>Wysokość=${h} mm`);
    }
}

function wybierzSkurcz(v, btn) {
    skurcz4 = v;
    document.getElementById("custom4").value = "";
    document.querySelectorAll("#mode4 .choice-grid:first-of-type .choice-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function wybierzInnySkurcz() {
    const v = n(document.getElementById("custom4").value);
    if (!isNaN(v)) {
        skurcz4 = v;
        document.querySelectorAll("#mode4 .choice-grid:first-of-type .choice-btn").forEach(b => b.classList.remove("active"));
    }
}

function updateChoice(active, inactive) {
    document.getElementById(active).classList.add("active");
    document.getElementById(inactive).classList.remove("active");
}

function calc4() {
    const w = n(document.getElementById("w4").value);
    if (!requireNumbers([w])) return blad(MSG_MISSING);

    const factor = 1 + skurcz4 / 100;
    const result = kierunek4 === "pow" ? w * factor : w / factor;

    setResult(result, "mm", "Kalkulator skurczu", `Wymiar=${w} mm<br>Skurcz=${skurcz4}%<br>Kierunek=${kierunek4 === "pow" ? "powiększ" : "pomniejsz"}`);
}

function calc5() {
    const k1 = n(document.getElementById("kat51").value);
    const k2 = n(document.getElementById("kat52").value);
    const l1 = n(document.getElementById("luz51").value);
    if (!requireNumbers([k1, k2, l1])) return blad(MSG_MISSING);

    const result = l1 * Math.cos(deg(k2)) / Math.cos(deg(k1));
    setResult(result, "mm", "Luzy znaków rdzeniowych", `Kąt 1=${k1}°<br>Kąt 2=${k2}°<br>Luz 1=${l1} mm`);
}

function calc6() {
    const k = n(document.getElementById("kat6").value);
    const h = n(document.getElementById("h6").value);
    const s = n(document.getElementById("s6").value);
    if (!requireNumbers([k, h, s])) return blad(MSG_MISSING);

    const result = s + h * Math.tan(deg(k));
    setResult(result, "mm", "Tworzenie śmietników", `Kąt=${k}°<br>Wysokość=${h} mm<br>Szerokość=${s} mm`);
}

function kopiuj() {
    if (!aktualnyWynik) return blad("Najpierw oblicz wynik.");
    kopiujTekst(aktualnyWynik);
}

function kopiujTekst(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => {
                setStatus("Skopiowano: " + text);
                setDetails(MSG_COPIED);
                toast("Skopiowano " + text);
            })
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.focus();
    area.select();

    try {
        document.execCommand("copy");
        setStatus("Skopiowano: " + text);
        setDetails(MSG_COPIED);
        toast("Skopiowano " + text);
    } catch {
        blad("Nie udało się skopiować.");
    }

    document.body.removeChild(area);
}

function wyczysc() {
    document.querySelectorAll(".mode.active input").forEach(i => i.value = "");
    aktualnyWynik = "0.00000000";
    document.getElementById("wynik").textContent = "0.00000000";
    setStatus("Wyczyszczono.");
    setDetails(MSG_CLEARED);
    const first = document.querySelector(".mode.active input");
    if (first) first.focus();
}

function saveHist() {
    localStorage.setItem("historiaKalkulatorModelarskiV12", JSON.stringify(historia));
    renderHist();
}

function renderHist() {
    const box = document.getElementById("history");
    box.innerHTML = "";

    if (historia.length === 0) {
        box.innerHTML = '<div class="history-data">Brak historii.</div>';
        return;
    }

    historia.forEach((h, i) => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
            <div class="history-result">${h.wynik} ${h.jednostka}</div>
            <div class="history-data">${h.czas} — ${h.nazwa}<br>${h.dane}</div>
            <div class="history-buttons">
                <button class="copy" type="button" onclick="kopiujHistorie(${i})">Kopiuj</button>
                <button class="danger" type="button" onclick="usunHistorie(${i})">Usuń</button>
            </div>
        `;
        box.appendChild(div);
    });
}

function kopiujHistorie(i) {
    aktualnyWynik = historia[i].wynik;
    document.getElementById("wynik").textContent = aktualnyWynik;
    document.getElementById("unit").textContent = historia[i].jednostka;
    kopiujTekst(aktualnyWynik);
}

function usunHistorie(i) {
    historia.splice(i, 1);
    saveHist();
    setStatus("Wpis historii usunięty.");
    toast("Wpis usunięty");
}

function wyczyscHistorie() {
    historia = [];
    saveHist();
    setStatus("Historia wyczyszczona.");
    toast("Historia wyczyszczona");
}

function ustawAutoKopiowanie(value) {
    autoKopiowanie = value;
    localStorage.setItem("autoKopiowanieKalkulatorModelarski", String(value));
    setStatus(value ? "Auto kopiowanie włączone." : "Auto kopiowanie wyłączone.");
    toast(value ? "Auto kopiowanie ON" : "Auto kopiowanie OFF");
}

function ustawMotyw(theme) {
    aktualnyMotyw = theme;
    localStorage.setItem("motywKalkulatorModelarski", theme);
    document.body.classList.toggle("theme-gray", theme === "gray");
    document.getElementById("themeDarkBtn").classList.toggle("active", theme === "dark");
    document.getElementById("themeGrayBtn").classList.toggle("active", theme === "gray");
    setStatus(theme === "dark" ? "Motyw ciemny." : "Motyw szary.");
}

function init() {
    document.getElementById("autoCopyToggle").checked = autoKopiowanie;
    ustawMotyw(aktualnyMotyw);
    ustawNachylenie(podtrybNachylenie);
    zmienTryb(tryb);
    renderHist();
}

document.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        oblicz();
    }

    if (e.key === "Escape") {
        e.preventDefault();
        wyczysc();
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && aktualnyWynik) {
        kopiuj();
    }

    if (e.key === "F1") { e.preventDefault(); zmienTryb(1); }
    if (e.key === "F2") { e.preventDefault(); zmienTryb(2); }
    if (e.key === "F3") { e.preventDefault(); zmienTryb(3); }
    if (e.key === "F4") { e.preventDefault(); zmienTryb(4); }
    if (e.key === "F5") { e.preventDefault(); zmienTryb(5); }
    if (e.key === "F6") { e.preventDefault(); zmienTryb(6); }
});

document.querySelectorAll("input").forEach(input => {
    input.addEventListener("focus", function() {
        this.select();
    });
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
}

init();
