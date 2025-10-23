
// Build lists
const sections = { planes: [], field: [], gods: [], monsters: [], history: [], secrets: [], finale: [] };
function addItem(section, file, title){ sections[section].push({file, title}); }
function buildLists(){
  for(const [sec, arr] of Object.entries(sections)){
    const ol = document.getElementById('list-'+sec); if(!ol) continue;
    arr.forEach(e=>{
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = 'entries/'+e.file;
      a.textContent = e.title;
      a.className = 'page-link';
      a.addEventListener('click', async (evt)=>{
        evt.preventDefault();
        if(!isUnlocked(e.file)){ playJumpScare(); return; }
        const res = await fetch(a.href);
        const html = await res.text();
        const art = document.createElement('article');
        art.innerHTML = html;
        document.querySelector('.pages').prepend(art);
        window.scrollTo({top: art.offsetTop-10, behavior:'smooth'});
      });
      li.appendChild(a); ol.appendChild(li);
    });
  }
  // Default unlocks: Plane of Water trio
  ['plane_water_1.html','plane_water_2.html','plane_water_3.html'].forEach(f=> localStorage.setItem('u_'+f,'1'));
  renderUnlockedList(); refreshLockBadges();
}
document.addEventListener('DOMContentLoaded', buildLists);

// Locking
const RUNE_MAP = {
  'DAWNFALL': ['plane_air_1.html','plane_air_2.html','plane_air_3.html','god_koriel_myth.html','god_koriel_fall.html'],
  'AURIC': ['plane_fire_1.html','plane_fire_2.html','plane_fire_3.html','god_bahamut_myth.html','god_bahamut_sundering.html'],
  'OCEANUS': ['plane_water_1.html','plane_water_2.html','plane_water_3.html'],
  'TEMPEST': ['secret_stormvault.html','field_02.html'],
  'ABYSSAL': ['plane_abyss_1.html','plane_abyss_2.html','secret_index.html'],
  'ASTRAEL': ['god_astrael_dream.html','god_astrael_corrupt.html'],
  'SERAPHIS': ['field_01.html','hist_12.html'],
  'VAELIN': ['secret_stormvault.html']
};
const ALWAYS_UNLOCKED = new Set(['plane_water_1.html','plane_water_2.html','plane_water_3.html']);
function isUnlocked(file){ if(ALWAYS_UNLOCKED.has(file)) return true; return !!localStorage.getItem('u_'+file); }
function unlockFiles(list){ list.forEach(f=> localStorage.setItem('u_'+f,'1')); }
function renderUnlockedList(){
  const ul=document.getElementById('unlockedList'); if(!ul) return; ul.innerHTML='';
  Object.keys(localStorage).filter(k=>k.startsWith('u_')).map(k=>k.slice(2)).sort().forEach(k=>{
    const li=document.createElement('li'); li.textContent=k; ul.appendChild(li);
  });
}
function refreshLockBadges(){
  document.querySelectorAll('.pages a.page-link').forEach(a=>{
    const file = a.href.split('/').slice(-1)[0];
    let tag=a.querySelector('.locked-tag-span');
    if(!isUnlocked(file)){
      a.classList.add('locked-link');
      if(!tag){ tag=document.createElement('span'); tag.className='locked-tag locked-tag-span'; tag.textContent='(locked)'; a.appendChild(tag); }
    } else {
      a.classList.remove('locked-link');
      if(tag) tag.remove();
    }
  });
}

// Seal and scare
function sealBurst(){
  const s=document.getElementById('sealOverlay'); s.classList.remove('hidden'); s.classList.add('show');
  try{ const a=new Audio('assets/sounds/fire-effect-367659.mp3'); a.volume=.4; a.play().catch(()=>{});}catch(e){}
  setTimeout(()=>{ s.classList.remove('show'); setTimeout(()=>s.classList.add('hidden'),200); }, 900);
}
function playJumpScare(){
  const el=document.getElementById('scareOverlay'); el.classList.remove('hidden'); el.classList.add('on');
  try{ const u=new SpeechSynthesisUtterance("You're not supposed to be here."); u.rate=.9; u.pitch=.8; u.volume=1.0; speechSynthesis.speak(u);}catch(e){}
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext; const ctx=new Ctx();
    const o=ctx.createOscillator(); const g=ctx.createGain();
    o.type='square'; o.frequency.value=220;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(1.0, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.45);
  }catch(e){
    try{ const b=new Audio('assets/sounds/fire-effect-367659.mp3'); b.volume=1.0; b.play().catch(()=>{});}catch(_){}
  }
  setTimeout(()=>{ el.classList.remove('on'); setTimeout(()=>el.classList.add('hidden'),120); }, 600);
}

// Rune entry + True Name
function attemptRune(){
  const input=document.getElementById('runeInput'); const word=(input.value||'').toUpperCase().trim();
  if(!word) return;
  if(word==='VAELINTHORNE'){
    document.querySelectorAll('.pages a.page-link').forEach(a=>{
      const f=a.href.split('/').slice(-1)[0]; localStorage.setItem('u_'+f,'1');
    });
    sealBurst(); renderUnlockedList(); refreshLockBadges(); input.value=''; return;
  }
  if(RUNE_MAP[word]){ unlockFiles(RUNE_MAP[word]); sealBurst(); renderUnlockedList(); refreshLockBadges(); }
  else { playJumpScare(); }
  input.value='';
}
document.addEventListener('DOMContentLoaded',()=>{
  const b=document.getElementById('runeBtn'); if(b) b.addEventListener('click',attemptRune);
  const i=document.getElementById('runeInput'); if(i) i.addEventListener('keydown', e=>{ if(e.key==='Enter') attemptRune(); });

  // Title x7 → prompt true name
  const h=document.querySelector('header h1'); let c=0;
  h.addEventListener('click',()=>{ c++; if(c>=7){ c=0; const name=prompt('The margin asks softly: Your True Name?'); if(((name||'').toUpperCase().replace(/\s+/g,'').trim())==='VAELINTHORNE'){ document.querySelectorAll('.pages a.page-link').forEach(a=>{ const f=a.href.split('/').slice(-1)[0]; localStorage.setItem('u_'+f,'1');}); sealBurst(); renderUnlockedList(); refreshLockBadges(); } else { playJumpScare(); } } });
});

// content will be appended

addItem('planes','plane_air_1.html','Plane of Air — Isles of the Unmoored');
addItem('planes','plane_air_2.html','Plane of Air — The Stormvault');
addItem('planes','plane_air_3.html','Plane of Air — Ki-rin Ascension Festival');
addItem('planes','plane_fire_1.html','Plane of Fire — Streets of Brass');
addItem('planes','plane_fire_2.html','Plane of Fire — Forge of Falling Suns');
addItem('planes','plane_fire_3.html','Plane of Fire — Before the Tiamat Ruse');
addItem('planes','plane_water_1.html','Plane of Water — The Tidal Library');
addItem('planes','plane_water_2.html','Plane of Water — Leviathan Rites');
addItem('planes','plane_water_3.html','Plane of Water — Umberlee’s Ransom');
addItem('planes','plane_earth_1.html','Plane of Earth — Steps of Jotunheim');
addItem('planes','plane_earth_2.html','Plane of Earth — Tremor Games');
addItem('planes','plane_earth_3.html','Plane of Earth — Annam’s Silence');
addItem('planes','plane_abyss_1.html','Abyss — The Ninety-Ninth Wound');
addItem('planes','plane_abyss_2.html','Abyss — Trials of Broken Names');
addItem('planes','plane_shadow_1.html','Shadowfell — Night of Echoes');
addItem('field','field_01.html','Field Note — 01');
addItem('field','field_02.html','Field Note — 02');
addItem('field','field_03.html','Field Note — 03');
addItem('field','field_04.html','Field Note — 04');
addItem('field','field_05.html','Field Note — 05');
addItem('field','field_06.html','Field Note — 06');
addItem('field','field_07.html','Field Note — 07');
addItem('field','field_08.html','Field Note — 08');
addItem('field','field_09.html','Field Note — 09');
addItem('field','field_10.html','Field Note — 10');
addItem('field','field_11.html','Field Note — 11');
addItem('field','field_12.html','Field Note — 12');
addItem('gods','god_bahamut_myth.html','Bahamut — Myth of Origin');
addItem('gods','god_bahamut_sundering.html','Bahamut — The Sundering Choice');
addItem('gods','god_koriel_myth.html','Koriel — Shepherd of Dawn');
addItem('gods','god_koriel_fall.html','Koriel — Fall to Red Storm');
addItem('gods','god_umberlee_tithe.html','Umberlee — Tithe of Lighthouses');
addItem('gods','god_verenestra_mask.html','Verenestra — Mask of Thorns');
addItem('gods','god_astrael_dream.html','Astrael — Dreamer of Mercy');
addItem('gods','god_astrael_corrupt.html','Astrael — Quiet Corruption');
addItem('gods','god_annam_shard.html','Annam — Shard of the All-Father');
addItem('gods','god_nameless_oath.html','The Nameless Oath');
addItem('monsters','mon_demogorgon.html','Demogorgon — Prince of Madness');
addItem('monsters','mon_leviathan.html','Leviathan — Typhoon’s Spine');
addItem('monsters','mon_ki_rin.html','Ki-rin — Judgment with Hooves');
addItem('monsters','mon_frostwind_virago.html','Frostwind Virago');
addItem('monsters','mon_illithilich.html','Illithilich — Thought That Forgot Flesh');
addItem('monsters','mon_shadow_dragon.html','Shadow Dragon — Lullaby Eater');
addItem('monsters','mon_brachydios.html','Brachydios — Pressure Made Monster');
addItem('monsters','mon_chorus_of_teeth.html','Chorus of Teeth');
addItem('monsters','mon_archivore.html','Archivore — Eater of Records');
addItem('monsters','mon_weeping_forge.html','The Weeping Forge');
addItem('monsters','mon_fractured_herald.html','Fractured Herald');
addItem('monsters','mon_sea_mourners.html','Sea Mourners');
addItem('monsters','mon_storm_goblin.html','Storm Goblins');
addItem('monsters','mon_jotun_coloss.html','Jotun Coloss — Oath-Bound');
addItem('history','hist_01.html','History — Chronicle 01');
addItem('history','hist_02.html','History — Chronicle 02');
addItem('history','hist_03.html','History — Chronicle 03');
addItem('history','hist_04.html','History — Chronicle 04');
addItem('history','hist_05.html','History — Chronicle 05');
addItem('history','hist_06.html','History — Chronicle 06');
addItem('history','hist_07.html','History — Chronicle 07');
addItem('history','hist_08.html','History — Chronicle 08');
addItem('history','hist_09.html','History — Chronicle 09');
addItem('history','hist_10.html','History — Chronicle 10');
addItem('history','hist_11.html','History — Chronicle 11');
addItem('history','hist_12.html','History — Chronicle 12');
addItem('secrets','secret_index.html','Secret Index — Hidden Coordinates');
addItem('secrets','secret_stormvault.html','Secret — The Stormvault');
addItem('secrets','secret_astral_greenhouse.html','Secret — Astral Greenhouse');
addItem('secrets','secret_leviathan_grave.html','Secret — Grave of the First Leviathan');
addItem('secrets','secret_forge_of_fallingsuns.html','Secret — Forge of Falling Suns');
addItem('finale','seal_finale.html','Finale — The Book Looks Back');
addItem('finale','true_ending.html','Epilogue — Verdant Expanse');