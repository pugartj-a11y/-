const GAMES=[
{id:"bg3",title:"Baldur's Gate 3",year:2023,genre:"RPG",platforms:["PC","PS5","Xbox"],rating:"9.6",desc:"Глубокая ролевая игра с огромным миром, тактическими боями и решениями, которые меняют историю.",mark:"BG3",shade:"#392f4d"},
{id:"elden-ring",title:"Elden Ring",year:2022,genre:"Action",platforms:["PC","PS5","Xbox"],rating:"9.4",desc:"Эпическое приключение в мрачном открытом мире, где исследование и сложные сражения идут рука об руку.",mark:"ER",shade:"#4b3b2d"},
{id:"zelda",title:"The Legend of Zelda: Tears of the Kingdom",year:2023,genre:"Adventure",platforms:["Switch"],rating:"9.5",desc:"Исследуй небеса, поверхность и подземелья Хайрула, собирая необычные устройства и раскрывая тайны мира.",mark:"Z",shade:"#33473f"},
{id:"cyberpunk",title:"Cyberpunk 2077",year:2020,genre:"RPG",platforms:["PC","PS5","Xbox"],rating:"8.9",desc:"Футуристический город, наёмник Ви и история о свободе выбора среди корпораций, имплантов и опасных сделок.",mark:"CP",shade:"#4b4530"},
{id:"hades",title:"Hades",year:2020,genre:"Indie",platforms:["PC","Switch"],rating:"9.0",desc:"Динамичный roguelike о побеге из подземного мира, где каждое новое прохождение открывает часть истории.",mark:"H",shade:"#4a3035"},
{id:"civilization",title:"Sid Meier's Civilization VI",year:2016,genre:"Strategy",platforms:["PC","Switch"],rating:"8.8",desc:"Построй цивилизацию с нуля, исследуй технологии, развивай города и решай судьбу своего народа.",mark:"VI",shade:"#3f4334"}
];

const $=s=>document.querySelector(s);
let currentAudio=null;

function gameCard(g){
  const text=`${g.title}. ${g.year} год. Жанр: ${g.genre}. Рейтинг: ${g.rating} из 10. ${g.desc}`;
  return `<article class="game-card">
    <div class="game-art" style="--shade:${g.shade}"><span>${g.mark}</span><b>★ ${g.rating}</b></div>
    <div class="game-info"><div><h3>${g.title}</h3><p>${g.year} · ${g.genre}</p></div>
      <button class="speak-btn" type="button" aria-label="Озвучить ${g.title}" data-speak="${encodeURIComponent(text)}">🔊</button>
      <p class="desc">${g.desc}</p>
      <div class="tags">${g.platforms.map(p=>`<span class="tag">${p}</span>`).join("")}</div>
    </div>
  </article>`;
}

function renderGames(){
  const box=$("#gamesGrid"); if(!box)return;
  const q=($("#search")?.value||"").toLowerCase();
  const genre=$("#genre")?.value||"all", platform=$("#platform")?.value||"all";
  const list=GAMES.filter(g=>(!q||g.title.toLowerCase().includes(q))&&(genre==="all"||g.genre===genre)&&(platform==="all"||g.platforms.includes(platform)));
  box.innerHTML=list.length?list.map(gameCard).join(""):'<div class="empty">Ничего не найдено. Попробуй другой фильтр.</div>';
  box.querySelectorAll("[data-speak]").forEach(btn=>btn.addEventListener("click",()=>speak(decodeURIComponent(btn.dataset.speak),btn)));
}

async function speak(text,button){
  stopAudio();
  if(button){button.classList.add("loading");button.disabled=true;}
  try{
    const res=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
    if(!res.ok)throw new Error("TTS request failed");
    const data=await res.json();
    if(!data.audioContent)throw new Error("No audio returned");
    const bytes=Uint8Array.from(atob(data.audioContent),c=>c.charCodeAt(0));
    const blob=new Blob([bytes],{type:"audio/mpeg"});
    currentAudio=new Audio(URL.createObjectURL(blob));
    currentAudio.onended=()=>{if(button){button.classList.remove("loading");button.disabled=false;}};
    currentAudio.play();
  }catch(err){
    console.error(err);
    alert("Не удалось озвучить текст. Проверь, запущен ли сервер и задан ли INWORLD_API_KEY.");
    if(button){button.classList.remove("loading");button.disabled=false;}
  }
}
function stopAudio(){if(currentAudio){currentAudio.pause();currentAudio=null;}}
$("#speakPage")?.addEventListener("click",()=>{
  const text="GAMEHUB. Игры, которые говорят с тобой. Каталог популярных игр с удобной озвучкой интерфейса. Нажми на кнопку динамика у любой карточки, чтобы услышать описание.";
  speak(text,$("#speakPage"));
});
$("#stopSpeech")?.addEventListener("click",stopAudio);
$("#search")?.addEventListener("input",renderGames);
$("#genre")?.addEventListener("change",renderGames);
$("#platform")?.addEventListener("change",renderGames);
const themeButton=$("#themeToggle");
if(localStorage.getItem("gamehub-theme")==="light")document.documentElement.dataset.theme="light";
if(themeButton)themeButton.onclick=()=>{const light=document.documentElement.dataset.theme==="light";document.documentElement.dataset.theme=light?"dark":"light";localStorage.setItem("gamehub-theme",light?"dark":"light");themeButton.textContent=light?"☾":"☀"};

// --- Глобальная озвучка интерфейса при наведении и фокусе ---
let hoverSpeakTimer=null;
let lastHoverElement=null;
let lastHoverAt=0;

function getSpeakableText(element){
  if(!element || element.closest("[aria-hidden=\"true\"]")) return "";
  if(element.matches("input, textarea")) return element.getAttribute("aria-label") || element.getAttribute("placeholder") || "";
  if(element.matches("select")) return element.getAttribute("aria-label") || element.options[element.selectedIndex]?.text || "";
  const labelled=element.getAttribute("aria-label");
  if(labelled) return labelled;
  return (element.innerText || element.textContent || "").replace(/\\s+/g," ").trim();
}

function speakHovered(element){
  const now=Date.now();
  if(!element || element===lastHoverElement && now-lastHoverAt<1800) return;
  const text=getSpeakableText(element);
  if(!text || text.length<2 || text.length>700) return;
  lastHoverElement=element;
  lastHoverAt=now;
  speak(text,element.matches("button,[role=\"button\"]") ? element : null);
}

document.addEventListener("mouseover",(event)=>{
  const element=event.target.closest("a,button,input,select,textarea,h1,h2,h3,p,label,.tag,.game-card,.voice-panel,.hero");
  if(!element || element.contains(event.relatedTarget)) return;
  clearTimeout(hoverSpeakTimer);
  hoverSpeakTimer=setTimeout(()=>speakHovered(element),350);
});

document.addEventListener("mouseout",(event)=>{
  if(!event.relatedTarget) clearTimeout(hoverSpeakTimer);
});

document.addEventListener("focusin",(event)=>{
  const element=event.target.closest("a,button,input,select,textarea,h1,h2,h3,p,label,.tag,.game-card");
  if(element) speakHovered(element);
});

document.querySelectorAll("[data-year]").forEach(e=>e.textContent=new Date().getFullYear());
renderGames();