'use strict';
(()=>{
const $=id=>document.getElementById(id), tidy=v=>String(v??'').trim();
const STORAGE='olfactory-carnival-sheet-v3';
let collection=[],eligible=[],source='Not loaded',lastDraw='',rotation=0,spinning=false,mood='all',mode='strange',pair=[null,null],busy=false,configuredUrl='',siteDefaultUrl='',backupNotes=new Map();
const keywords={dark:['oud','incense','resin','smok','tobacco','frankincense','myrrh','amber','labdanum','copal','burnt'],marine:['salt','sea','marine','ocean','mineral','rain','aquatic','wet','stone','coastal','ambergris'],floral:['rose','jasmine','floral','flower','tuberose','iris','violet','ylang','orange blossom','magnolia','lily'],green:['green','moss','leaf','leaves','forest','cedar','vetiver','pine','grass','herbal','earth','wood','patchouli'],sweet:['fruit','berry','honey','vanilla','apple','pear','sweet','tonka','coconut','caramel','fig','plum'],spice:['saffron','spice','spicy','pepper','cinnamon','ginger','cardamom','clove','nutmeg'],leather:['leather','suede','musk','animalic','civet','skin','castoreum','ambergris']};
const ALL_TYPES=['bottle','travel','sample','attar'];
function esc(s){return tidy(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function key(r){return (r.house+'|'+r.fragrance).toLocaleLowerCase();}
function dedupe(rows){const seen=new Map;rows.forEach(r=>{if(r.house&&r.fragrance)seen.set(key(r),r)});return [...seen.values()];}
function csvRows(raw){raw=raw.replace(/^\uFEFF/,'');const out=[];let row=[],field='',quoted=false;for(let i=0;i<raw.length;i++){let c=raw[i];if(c==='"'){if(quoted&&raw[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&raw[i+1]==='\n')i++;row.push(field);field='';if(row.some(t=>tidy(t)))out.push(row);row=[];}else field+=c;}row.push(field);if(row.some(t=>tidy(t)))out.push(row);if(quoted)throw Error('Unclosed quotation mark in CSV.');return out;}
function parseCSV(text){
 const rows=csvRows(text);if(!rows.length)throw Error('The published sheet is empty.');
 const names=rows.shift().map(x=>tidy(x).toLowerCase().replace(/\s+/g,' '));
 const col=(exact,contains=[])=>{let k=names.findIndex(x=>exact.includes(x));if(k<0)k=names.findIndex(x=>contains.some(y=>x.includes(y)));return k;};
 const hi=col(['house','brand'],['house','brand']),fi=col(['fragrance','perfume','name'],['fragrance','perfume']);
 const ci=col(['carnival line','one-liner','one liner'],['carnival line','one-liner']);
 const ni=col(['key notes / source description','key notes','notes / accords','notes'],['key notes','source description','notes']);
 const ai=col(['inferred accord families (for pairing)','inferred accord families','accord families','accords'],['accord famil','accords']);
 const ii=col(['personal impressions (condensed)','personal impressions','my impressions'],['personal impression','my impression']);
 const ti=col(['type','format','size / type'],['format','type']);
 if(hi<0||fi<0)throw Error('This sheet needs columns named House and Fragrance.');
 return dedupe(rows.map(r=>({house:tidy(r[hi]),fragrance:tidy(r[fi]),carnivalLine:ci<0?'':tidy(r[ci]),keyNotes:ni<0?'':tidy(r[ni]),accords:ai<0?'':tidy(r[ai]),impressions:ii<0?'':tidy(r[ii]),type:ti<0?'':tidy(r[ti])})).filter(r=>r.house&&r.fragrance));
}
function normalizeJSON(data){if(!Array.isArray(data))throw Error('The fallback collection is not an array.');return dedupe(data.map(r=>({house:tidy(r.house||r.House),fragrance:tidy(r.fragrance||r.Fragrance),carnivalLine:tidy(r.carnivalLine||r['Carnival Line']||r.notes||r.description),keyNotes:tidy(r.keyNotes||r['Key Notes / Source Description']||r.notes),accords:tidy(r.accords||r['Inferred Accord Families (for pairing)']),impressions:tidy(r.impressions||r['Personal Impressions (Condensed)']||r['My Impressions']),type:tidy(r.type||r.Type||r.format)})));}
function typeFor(r){const s=r.type.toLowerCase();if(/attar|oil/.test(s))return 'attar';if(/sample|vial|tester/.test(s))return 'sample';if(/travel|decant|miniature/.test(s))return 'travel';return 'bottle';}
function allowedTypes(){return new Set([...document.querySelectorAll('[data-type]')].filter(x=>x.checked).map(x=>x.dataset.type));}
function updateEligibility(){eligible=collection.slice();$('wheel-eligible').textContent=eligible.length;renderCollection();if(eligible.length===0){$('wheel-status').textContent='No fragrances are available. Check your connection.';}}
function setLight(good){['connection-light','settings-light'].forEach(id=>$(id).classList.toggle('good',good));}
function setCollection(rows,label){if(label==='Live Google Sheet')rows=rows.map(r=>{const b=backupNotes.get(key(r));return b?{...r,carnivalLine:r.carnivalLine||b.carnivalLine,keyNotes:r.keyNotes||b.keyNotes,accords:r.accords||b.accords,impressions:r.impressions||b.impressions}:r;});if(!rows.length)throw Error('No fragrances were found.');collection=dedupe(rows);source=label;setLight(label==='Live Google Sheet');$('source-status').textContent=label;$('connection-detail').textContent=`${collection.length} distinct fragrances available.`;$('top-count').textContent=`${collection.length} fragrances`;$('data-count').textContent=collection.length;if(label==='Live Google Sheet')$('last-refresh').textContent=new Date().toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});updateEligibility();renderCollection();$('wheel-status').textContent='The wheel is ready.';}
function renderCollection(){const q=tidy($('search').value).toLowerCase(),house=$('house-filter').value;const prev=house;const houses=[...new Set(collection.map(r=>r.house))].sort((a,b)=>a.localeCompare(b));$('house-filter').replaceChildren(new Option('All houses',''),...houses.map(h=>new Option(h,h)));$('house-filter').value=houses.includes(prev)?prev:'';const found=collection.filter(r=>(!house||r.house===house)&&(r.house+' '+r.fragrance+' '+r.carnivalLine+' '+r.keyNotes+' '+r.accords+' '+r.impressions).toLowerCase().includes(q));$('collection-summary').textContent=`Showing ${found.length} of ${collection.length} fragrances`;$('collection-items').innerHTML=found.map(r=>`<article class="collection-item panel">${bottleArt(r,true)}<small>${esc(r.house)}</small><h3>${esc(r.fragrance)}</h3>${details(r)}</article>`).join('')||'<div class="panel padded">No fragrances matched your search.</div>';}
function pick(list,exclude=[]){const used=new Set(exclude.map(x=>x&&key(x)));const candidates=list.filter(r=>!used.has(key(r)));return candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:null;}
function description(r){return r.carnivalLine||r.keyNotes||'No description recorded yet.';}
function details(r){return `<p class="card-line">${esc(description(r))}</p>${r.accords?`<div class="accord-chips">${r.accords.split(',').map(x=>`<span>${esc(x.trim())}</span>`).join('')}</div>`:''}${r.keyNotes?`<details class="notes-disclosure"><summary>Explore the notes</summary><p>${esc(r.keyNotes)}</p></details>`:''}${r.impressions?`<p class="personal"><em>YOUR IMPRESSION · ${esc(r.impressions)}</em></p>`:''}`;}

function bottleArt(r,compact=false){
 // The generic illustrated flacons never imply manufacturer packaging.
 const accords=accordSet(r);
 let variant='amber';
 if(accords.has('marine/mineral')||accords.has('green/earthy'))variant='teal';
 else if(accords.has('floral')||accords.has('fruity')||accords.has('sweet/gourmand'))variant='rose';
 return `<div class="asset-bottle ${compact?'compact':''} ${variant}" role="img" aria-label="Decorative, non-branded perfume bottle illustration"></div>`;
}
function fragranceCard(r){return `<div class="display-fragrance">${bottleArt(r)}<small class="display-house">${esc(r.house)}</small><h3>${esc(r.fragrance)}</h3>${details(r)}</div>`;}
function showView(id){document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));window.scrollTo({top:0,behavior:'instant'});}
function spin(){if(spinning)return;if(!eligible.length){$('wheel-status').textContent='No fragrances are available. Check your connection.';return;}spinning=true;$('spin-btn').disabled=true;$('wheel-result').classList.add('hidden');$('wheel-status').textContent='The wheel is turning…';let selected=pick(eligible,eligible.length>1?eligible.filter(r=>key(r)===lastDraw):[]);rotation+=1800+360*Math.random();$('wheel-face').style.transform=`rotate(${rotation}deg)`;setTimeout(()=>{lastDraw=key(selected);spinning=false;$('spin-btn').disabled=false;$('wheel-status').textContent='Fortune has spoken.';$('wheel-result').innerHTML='<p class="eyebrow">YOUR FRAGRANCE</p>'+fragranceCard(selected);$('wheel-result').classList.remove('hidden');},4200);}
const moodAccords={dark:['oud','incense','smoky'],marine:['marine/mineral'],floral:['floral'],green:['green/earthy','woody'],sweet:['sweet/gourmand','fruity'],spice:['spicy'],leather:['leather/musk']};
const moodLabels={dark:'dark resins',marine:'marine minerality',floral:'florals',green:'green woods',sweet:'fruit and sweetness',spice:'warm spice',leather:'leather and musk'};
function accordSet(r){return new Set(tidy(r.accords).toLowerCase().split(',').map(x=>x.trim()).filter(Boolean));}
function matchingAccords(a,b){const aa=accordSet(a),bb=accordSet(b);return [...aa].filter(x=>bb.has(x));}
function score(r,theme){const a=accordSet(r);const explicit=(moodAccords[theme]||[]).filter(x=>a.has(x)).length;
 if(r.accords)return explicit*4;
 const s=(r.keyNotes+' '+r.carnivalLine).toLowerCase();return (keywords[theme]||[]).reduce((n,w)=>n+(s.includes(w)?1:0),0);}
function drawPoison(){let list=eligible;if(mood!=='all')list=eligible.filter(r=>score(r,mood)>0);if(!list.length){$('poison-status').textContent='No matches were found for this mood. Try another mood or refresh the collection.';return;}const r=pick(list);$('poison-result').innerHTML=fragranceCard(r);$('poison-status').textContent=`Selected from ${list.length} eligible ${mood==='all'?'fragrances':moodLabels[mood]+' matches'}.`;}
function similarities(a,b){return matchingAccords(a,b);}
function pairCandidates(base,selectionMode){const rest=eligible.filter(r=>key(r)!==key(base));if(selectionMode==='chaos'||!rest.length)return rest;
 const bs=accordSet(base),scored=rest.map(r=>{const shared=matchingAccords(base,r).length,unique=[...accordSet(r)].filter(x=>!bs.has(x)).length;return {r,shared,unique};});
 if(selectionMode==='love'){const max=Math.max(...scored.map(x=>x.shared));if(max>0)return scored.filter(x=>x.shared>=Math.max(1,max-1)).map(x=>x.r);}
 if(selectionMode==='strange'){// contrast with a possible bridge: reward one shared accord and several different accords
  const candidates=scored.filter(x=>x.shared<=1&&x.unique>=2);if(candidates.length)return candidates.map(x=>x.r);
  const maxUnique=Math.max(...scored.map(x=>x.unique));return scored.filter(x=>x.unique===maxUnique).map(x=>x.r);}
 return rest;
}
function renderPair(){[0,1].forEach(i=>{$('pair-'+(i?'two':'one')).innerHTML=pair[i]?`${bottleArt(pair[i],true)}<small class="display-house">${esc(pair[i].house)}</small><h3>${esc(pair[i].fragrance)}</h3>${details(pair[i])}`:`<div class="bottle-symbol">✧</div><h3>A mystery</h3><p>Awaiting the draw...</p>`;});
 if(pair[0]&&pair[1]){const shared=similarities(pair[0],pair[1]),a=accordSet(pair[0]),b=accordSet(pair[1]);const uniqueA=[...a].filter(x=>!b.has(x)),uniqueB=[...b].filter(x=>!a.has(x));
 const bridge=shared.length?`A potential bridge is ${shared.slice(0,2).join(' and ')}.`:'There is no accord-family overlap recorded.';
 const contrast=uniqueA.length&&uniqueB.length?` ${pair[0].fragrance} brings ${uniqueA.slice(0,2).join(' and ')}, while ${pair[1].fragrance} adds ${uniqueB.slice(0,2).join(' and ')}.`:'';
 const theory=mode==='chaos'?'No compatibility filter was used. This is a true chance encounter.':mode==='love'?`The two fragrances share ${shared.length} accord ${shared.length===1?'family':'families'}. ${bridge}${contrast}`:`An experiment in contrast. ${bridge}${contrast}`;
 $('pair-analysis').innerHTML='<p class="eyebrow">THE ALCHEMIST\'S THEORY</p><p>'+esc(theory)+'</p><p class="micro">Based on the inferred accord families in Olfactory Carnival v3; not a prediction of skin chemistry. Test each lightly first.</p>';}}
function drawPair(){if(eligible.length<2){$('pair-status').textContent='At least two eligible fragrances are needed.';return;}const lockA=$('lock-one').checked&&!!pair[0],lockB=$('lock-two').checked&&!!pair[1];if(lockA&&lockB){$('pair-status').textContent='Both cards are locked. Unlock one to reroll.';return;}if(!lockA&&!lockB){pair[0]=pick(eligible);pair[1]=pick(pairCandidates(pair[0],mode),[]);}else if(lockA){pair[1]=pick(pairCandidates(pair[0],mode),pair[1]?[pair[1]]:[] )||pick(pairCandidates(pair[0],mode));}else{pair[0]=pick(pairCandidates(pair[1],mode),pair[0]?[pair[0]]:[])||pick(pairCandidates(pair[1],mode));}renderPair();$('pair-draw').textContent='✧  REROLL UNLOCKED';$('pair-status').textContent='Lock either fragrance to keep it for your next draw.';}
function sheetCSV(url){
 url=tidy(url);if(!url)throw Error('Paste a Google Sheets URL first.');
 let u;try{u=new URL(url);}catch(e){throw Error('That does not look like a complete URL.');}
 if(u.protocol!=='https:'||u.hostname!=='docs.google.com'||!u.pathname.startsWith('/spreadsheets/'))throw Error('Paste a URL from Google Sheets.');
 // Accept published CSV URLs, publicly-readable share links, or export URLs.
 if(u.pathname.includes('/pubhtml'))u.pathname=u.pathname.replace('/pubhtml','/pub');
 const id=(u.pathname.match(/^\/spreadsheets\/d\/([^/]+)/)||[])[1];
 if(u.pathname.includes('/edit')||u.pathname.includes('/view')||u.pathname.endsWith('/')){
   if(!id)throw Error('Could not read the spreadsheet ID.');
   const gid=u.searchParams.get('gid')||(u.hash.match(/gid=(\d+)/)||[])[1]||'0';
   u=new URL('https://docs.google.com/spreadsheets/d/'+encodeURIComponent(id)+'/export?format=csv&gid='+encodeURIComponent(gid));
 }else if(u.pathname.endsWith('/export'))u.searchParams.set('format','csv');
 else if(u.pathname.endsWith('/pub'))u.searchParams.set('output','csv');
 else throw Error('Use the Google Sheet sharing link or Publish to web → CSV link.');
 return u.toString();
}
async function fetchSheet(url){
 const normalized=sheetCSV(url), fresh=new URL(normalized);
 fresh.searchParams.set('_carnivalRefresh',Date.now().toString());
 const response=await fetch(fresh.toString(),{cache:'no-store'});
 if(!response.ok)throw Error('Google returned HTTP '+response.status+'. Check the sharing/publication settings.');
 const text=await response.text(), rows=parseCSV(text);
 if(!rows.length)throw Error('No fragrance rows were found.');
 return {rows,url:normalized};
}
async function refreshSheet(url,save=false){
 if(busy)return;busy=true;
 $('source-status').textContent='Connecting to Google Sheets…';$('connection-detail').textContent='Fetching the latest fragrance records.';
 try{
  const normalized=sheetCSV(url);
  if(save){try{localStorage.setItem(STORAGE,normalized);}catch(e){}configuredUrl=normalized;$('sheet-url').value=normalized;}
  const data=await fetchSheet(normalized);
  setCollection(data.rows,'Live Google Sheet');
  $('source-status').textContent='Live Google Sheet connected';
  $('connection-detail').textContent=`${data.rows.length} fragrances loaded from Olfactory Carnival v3.`;
  configuredUrl=normalized;
 }catch(e){
  $('source-status').textContent=collection.length?'Connection unsuccessful · backup retained':'Connection unsuccessful';
  $('connection-detail').textContent=e.message;
  setLight(false);
 }finally{busy=false;}
}
async function testSheet(){
 if(busy)return;busy=true;
 $('source-status').textContent='Testing the link…';
 try{
  const data=await fetchSheet($('sheet-url').value);
  $('source-status').textContent='Link test passed';
  $('connection-detail').textContent=`Google returned ${data.rows.length} fragrance rows. Click SAVE LINK & CONNECT to use it.`;
  setLight(source==='Live Google Sheet');
 }catch(e){
  $('source-status').textContent='Link test failed';$('connection-detail').textContent=e.message;setLight(source==='Live Google Sheet');
 }finally{busy=false;}
}
function resetSheet(){
 try{localStorage.removeItem(STORAGE);localStorage.removeItem('carnival-sheet-url');}catch(e){}
 configuredUrl=siteDefaultUrl;
 $('sheet-url').value=siteDefaultUrl;
 if(siteDefaultUrl){refreshSheet(siteDefaultUrl);}else{
  $('source-status').textContent='No site-default Google Sheet URL';
  $('connection-detail').textContent='Paste your published link above, then use SAVE LINK & CONNECT. Your included collection stays available.';
 }
}
async function init(){document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));$('spin-btn').addEventListener('click',spin);$('poison-draw').addEventListener('click',drawPoison);document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>{mood=b.dataset.mood;document.querySelectorAll('[data-mood]').forEach(x=>x.classList.toggle('selected',x===b));}));document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',x===b));$('pair-status').textContent='Pairing mode changed. Draw to see your new pairing.';}));$('pair-draw').addEventListener('click',drawPair);$('search').addEventListener('input',renderCollection);$('house-filter').addEventListener('change',renderCollection);$('save-sheet').addEventListener('click',()=>refreshSheet($('sheet-url').value,true));$('test-sheet').addEventListener('click',testSheet);$('reset-sheet').addEventListener('click',resetSheet);$('refresh-sheet').addEventListener('click',()=>refreshSheet($('sheet-url').value||configuredUrl));$('collection-refresh').addEventListener('click',()=>refreshSheet($('sheet-url').value||configuredUrl));// Keep the shipped backup collection in place, but never overwrite a successful live Google Sheet load.
try{const response=await fetch('collection.json',{cache:'no-store'});if(response.ok){const fallback=normalizeJSON(await response.json());backupNotes=new Map(fallback.map(r=>[key(r),r]));setCollection(fallback,'Included collection · offline fallback');}}catch(e){$('connection-detail').textContent='Fallback collection could not be loaded: '+e.message;}
let fromConfig='';try{const response=await fetch('config.json',{cache:'no-store'});if(response.ok){const cfg=await response.json();fromConfig=tidy(cfg.googleSheetsCsvUrl||cfg.googleSheetCsvUrl||'');}}catch(e){}
let saved='';try{saved=localStorage.getItem(STORAGE)||localStorage.getItem('carnival-sheet-url')||'';}catch(e){}
siteDefaultUrl=fromConfig;const url=saved||fromConfig;configuredUrl=url;$('sheet-url').value=url;
if(url)await refreshSheet(url);else if(collection.length)$('connection-detail').textContent='No Google Sheet connected; using the included 82-fragrance collection.';else{$('top-count').textContent='Connection needed';$('source-status').textContent='Connect your Google Sheet';$('connection-detail').textContent='Paste the published CSV URL above. Your GitHub collection.json is also available as a fallback.';}
}
init().catch(e=>{const el=$('connection-detail');if(el)el.textContent='App initialization issue: '+e.message;});
})();
