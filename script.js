let tryb = Number(localStorage.getItem("ostatniTrybKalkulatorModelarski")) || 1;
let podtrybNachylenie = 1;
let aktualnyWynik = "";
let aktualnaJednostka = "°";
let skurcz4 = 1.5;
let kierunek4 = "pow";
let historia = JSON.parse(localStorage.getItem("historiaKalkulatorModelarskiV10")) || [];

function n(v){ return parseFloat(String(v).replace(",", ".")); }
function deg(v){ return v * Math.PI / 180; }
function rad(v){ return v * 180 / Math.PI; }
function f8(v){ return v.toFixed(8); }

function setStatus(t){ document.getElementById("status").textContent = t || "Gotowy"; }

let toastTimer;
function toast(t){
    const el = document.getElementById("toast");
    el.textContent = t;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1300);
}

function toggleHistoria(){ document.getElementById("drawer").classList.toggle("open"); }

function zmienTryb(t){
    tryb = t;
    localStorage.setItem("ostatniTrybKalkulatorModelarski", String(t));
    document.querySelectorAll(".nav-btn").forEach((b,i)=>b.classList.toggle("active", i+1===t));
    document.querySelectorAll(".mode").forEach((m,i)=>m.classList.toggle("active", i+1===t));
    aktualnyWynik = "";
    document.getElementById("wynik").textContent = "—";
    setStatus("Zmieniono tryb.");
    updateOpis();
    const first = document.querySelector(".mode.active input");
    if(first) first.focus();
}

function updateOpis(){
    const d=document.getElementById("details");
    const u=document.getElementById("unit");
    if(tryb===1){ u.textContent="°"; d.innerHTML="Narzędzie gotowe do obliczeń."; }
    if(tryb===2){ u.textContent="°"; d.innerHTML="Narzędzie gotowe do obliczeń."; }
    if(tryb===3){ u.textContent=podtrybNachylenie===1||podtrybNachylenie===3 ? "%" : (podtrybNachylenie===2 ? "°" : "mm"); d.innerHTML="Narzędzie gotowe do obliczeń."; }
    if(tryb===4){ u.textContent="mm"; d.innerHTML="Narzędzie gotowe do obliczeń."; }
    if(tryb===5){ u.textContent="mm"; d.innerHTML="Narzędzie gotowe do obliczeń."; }
    if(tryb===6){ u.textContent="mm"; d.innerHTML="Narzędzie gotowe do obliczeń."; }
}

function ustawNachylenie(t){
    podtrybNachylenie = t;
    document.querySelectorAll("#mode3 .submode").forEach((el,i)=>el.classList.toggle("active", i+1===t));
    document.querySelectorAll("#mode3 .choice-btn").forEach((el,i)=>el.classList.toggle("active", i+1===t));
    aktualnyWynik = "";
    document.getElementById("wynik").textContent = "—";
    updateOpis();
    const first = document.querySelector("#mode3 .submode.active input");
    if(first) first.focus();
}

function oblicz(){
    if(tryb===1) calc1();
    if(tryb===2) calc2();
    if(tryb===3) calc3();
    if(tryb===4) calc4();
    if(tryb===5) calc5();
    if(tryb===6) calc6();
}

function setResult(wynik, jednostka, nazwa, dane, szczegoly){
    aktualnyWynik=f8(wynik);
    aktualnaJednostka=jednostka;
    document.getElementById("wynik").textContent=aktualnyWynik;
    document.getElementById("unit").textContent=jednostka;
    document.getElementById("details").innerHTML=szczegoly;
    historia.unshift({
        czas:new Date().toLocaleTimeString("pl-PL"),
        nazwa,
        wynik:aktualnyWynik,
        jednostka,
        dane
    });
    historia=historia.slice(0,20);
    saveHist();
    kopiuj();
    setStatus("Wynik obliczony.");
}

function blad(t){
    aktualnyWynik="";
    document.getElementById("wynik").textContent="—";
    setStatus(t);
    toast(t);
}

function calc1(){
    const A=n(document.getElementById("a1").value);
    const B=n(document.getElementById("b1").value);
    if(isNaN(A)||isNaN(B)) return blad("Podaj A i B.");
    if(B===0) return blad("B nie może być równe 0.");
    const w=rad(Math.atan(A/B));
    setResult(w,"°","Arcus TG",`A=${A} mm<br>B=${B} mm`,`Dane zapisane w historii.`);
}

function calc2(){
    const A=n(document.getElementById("a2").value);
    const alfa=n(document.getElementById("alfa2").value);
    const B=n(document.getElementById("b2").value);
    if(isNaN(A)||isNaN(alfa)||isNaN(B)) return blad("Podaj A, α i B.");
    if(B===0) return blad("B nie może być równe 0.");
    const przes=A*Math.tan(deg(alfa));
    const beta=rad(Math.atan(przes/B));
    setResult(beta,"°","Kąt β",`A=${A} mm<br>α=${alfa}°<br>B=${B} mm`,`Przesunięcie: ${f8(przes)} mm`);
}

function calc3(){
    if(podtrybNachylenie===1){
        const A=n(document.getElementById("nA").value);
        const B=n(document.getElementById("nB").value);
        if(isNaN(A)||isNaN(B)) return blad("Podaj A i B.");
        if(B===0) return blad("B nie może być równe 0.");
        setResult((A/B)*100, "%", "Nachylenie mm → %", `A=${A} mm<br>B=${B} mm`, "Dane zapisane w historii.");
    }
    if(podtrybNachylenie===2){
        const p=n(document.getElementById("nProc").value);
        if(isNaN(p)) return blad("Podaj procent.");
        setResult(rad(Math.atan(p/100)), "°", "Nachylenie % → °", `Nachylenie=${p}%`, "Dane zapisane w historii.");
    }
    if(podtrybNachylenie===3){
        const k=n(document.getElementById("nKat").value);
        if(isNaN(k)) return blad("Podaj kąt.");
        setResult(Math.tan(deg(k))*100, "%", "Nachylenie ° → %", `Kąt=${k}°`, "Dane zapisane w historii.");
    }
    if(podtrybNachylenie===4){
        const p=n(document.getElementById("nProc2").value);
        const h=n(document.getElementById("nWys").value);
        if(isNaN(p)||isNaN(h)) return blad("Podaj procent i wysokość.");
        setResult(h*p/100, "mm", "Nachylenie % + wysokość", `Nachylenie=${p}%<br>Wysokość=${h} mm`, "Dane zapisane w historii.");
    }
}

function wybierzSkurcz(v,btn){
    skurcz4=v;
    document.getElementById("custom4").value="";
    document.querySelectorAll("#mode4 .choice-grid:first-of-type .choice-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
}

function wybierzInnySkurcz(){
    const v=n(document.getElementById("custom4").value);
    if(!isNaN(v)){
        skurcz4=v;
        document.querySelectorAll("#mode4 .choice-grid:first-of-type .choice-btn").forEach(b=>b.classList.remove("active"));
    }
}

function updateChoice(active, inactive){
    document.getElementById(active).classList.add("active");
    document.getElementById(inactive).classList.remove("active");
}

function calc4(){
    const w=n(document.getElementById("w4").value);
    if(isNaN(w)) return blad("Podaj wymiar.");
    const mnoz=1+skurcz4/100;
    const wynik=kierunek4==="pow" ? w*mnoz : w/mnoz;
    const rozn=wynik-w;
    setResult(
        wynik,
        "mm",
        "Skurcz",
        `Wymiar=${w} mm<br>Skurcz=${skurcz4}%<br>Kierunek=${kierunek4==="pow"?"powiększ":"pomniejsz"}`,
        `Skurcz: ${skurcz4}%<br>Różnica: ${rozn>=0?"+":""}${f8(rozn)} mm`
    );
}

function calc5(){
    const k1=n(document.getElementById("kat51").value);
    const k2=n(document.getElementById("kat52").value);
    const l1=n(document.getElementById("luz51").value);
    if(isNaN(k1)||isNaN(k2)||isNaN(l1)) return blad("Podaj kąt 1, kąt 2 i luz.");
    const wynik=l1*Math.cos(deg(k2))/Math.cos(deg(k1));
    setResult(
        wynik,
        "mm",
        "Luzy znaków rdzeniowych",
        `Kąt 1=${k1}°<br>Kąt 2=${k2}°<br>Luz 1=${l1} mm`,
        `Dane zapisane w historii.`
    );
}

function calc6(){
    const k=n(document.getElementById("kat6").value);
    const h=n(document.getElementById("h6").value);
    const s=n(document.getElementById("s6").value);
    if(isNaN(k)||isNaN(h)||isNaN(s)) return blad("Podaj kąt, wysokość i szerokość.");
    const przyrost=h*Math.tan(deg(k));
    const wynik=s+przyrost;
    setResult(
        wynik,
        "mm",
        "Tworzenie śmietników",
        `Kąt=${k}°<br>Wysokość=${h} mm<br>Szerokość=${s} mm`,
        `Przyrost: ${f8(przyrost)} mm`
    );
}

function kopiuj(){
    if(!aktualnyWynik) return blad("Najpierw oblicz wynik.");
    kopiujTekst(aktualnyWynik);
}

function kopiujTekst(t){
    if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(t)
            .then(()=>{ setStatus("Skopiowano: " + t); toast("Skopiowano " + t); })
            .catch(()=>fallbackCopy(t));
    } else {
        fallbackCopy(t);
    }
}

function fallbackCopy(t){
    const area=document.createElement("textarea");
    area.value=t;
    area.style.position="fixed";
    area.style.left="-9999px";
    document.body.appendChild(area);
    area.focus();
    area.select();
    try {
        document.execCommand("copy");
        setStatus("Skopiowano: " + t);
        toast("Skopiowano " + t);
    } catch {
        setStatus("Nie udało się skopiować.");
        toast("Nie udało się skopiować.");
    }
    document.body.removeChild(area);
}

function wyczysc(){
    document.querySelectorAll(".mode.active input").forEach(i=>i.value="");
    aktualnyWynik="";
    document.getElementById("wynik").textContent="—";
    setStatus("Wyczyszczono.");
    const first = document.querySelector(".mode.active input");
    if(first) first.focus();
}

function saveHist(){
    localStorage.setItem("historiaKalkulatorModelarskiV10", JSON.stringify(historia));
    renderHist();
}

function renderHist(){
    const box=document.getElementById("history");
    box.innerHTML="";
    if(historia.length===0){
        box.innerHTML='<div class="small-note">Brak historii.</div>';
        return;
    }
    historia.forEach((h,i)=>{
        const div=document.createElement("div");
        div.className="history-item";
        div.innerHTML=`
            <div class="history-result">${h.wynik} ${h.jednostka}</div>
            <div class="history-data">
                ${h.czas} — ${h.nazwa}<br>
                ${h.dane}
            </div>
            <div class="history-buttons">
                <button class="copy" onclick="kopiujHistorie(${i})">Kopiuj</button>
                <button class="danger" onclick="usunHistorie(${i})">Usuń</button>
            </div>
        `;
        box.appendChild(div);
    });
}

function kopiujHistorie(i){
    aktualnyWynik=historia[i].wynik;
    document.getElementById("wynik").textContent=aktualnyWynik;
    document.getElementById("unit").textContent=historia[i].jednostka;
    kopiujTekst(aktualnyWynik);
}

function usunHistorie(i){
    historia.splice(i,1);
    saveHist();
    setStatus("Wpis historii usunięty.");
    toast("Wpis usunięty");
}

function wyczyscHistorie(){
    historia=[];
    saveHist();
    setStatus("Historia wyczyszczona.");
    toast("Historia wyczyszczona");
}

document.addEventListener("keydown", e=>{
    if(e.key==="Enter") { e.preventDefault(); oblicz(); }
    if(e.key==="Escape") { e.preventDefault(); wyczysc(); }
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="c" && aktualnyWynik) { kopiuj(); }
    if(e.key==="F1"){ e.preventDefault(); zmienTryb(1); }
    if(e.key==="F2"){ e.preventDefault(); zmienTryb(2); }
    if(e.key==="F3"){ e.preventDefault(); zmienTryb(3); }
    if(e.key==="F4"){ e.preventDefault(); zmienTryb(4); }
    if(e.key==="F5"){ e.preventDefault(); zmienTryb(5); }
    if(e.key==="F6"){ e.preventDefault(); zmienTryb(6); }
});

document.querySelectorAll("input").forEach(i=>{
    i.addEventListener("focus", function(){ this.select(); });
});

if("serviceWorker" in navigator && location.protocol.startsWith("http")){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
}

ustawNachylenie(1);
zmienTryb(tryb);
renderHist();
