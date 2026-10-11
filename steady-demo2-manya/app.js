const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let LG='en',HC=0,NM={mom:'Mom',helper:'Alex'},AUTO=0,CODE='',ME='',DB=null,SEEN={},WL={},unsub=null,lastTab='';
try{LG=localStorage.getItem('lg')||'en';HC=+localStorage.getItem('hc')||0;NM=JSON.parse(localStorage.getItem('nm'))||NM;AUTO=+localStorage.getItem('auto')||0;CODE=localStorage.getItem('code')||'';ME=localStorage.getItem('me')||''}catch(e){}
const sv=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const L={hi:{Home:'होम','What changed':'क्या बदला','My privacy':'मेरी गोपनीयता',Settings:'सेटिंग्स',Helper:'सहायक',Speak:'🎤 बोलिए',Send:'भेजें',Done:'हो गया',Listen:'सुनें',Morning:'सुबह',Evening:'शाम','Keep always':'हमेशा रखें','Keep on one day':'एक दिन के लिए रखें','Call family':'परिवार को फ़ोन',Photos:'तस्वीरें',Weather:'मौसम','Change my screen':'स्क्रीन बदलें','What do you need right now?':'अभी आपको क्या चाहिए?','How should your screen change?':'स्क्रीन कैसे बदलनी है?','These buttons stay where you left them.':'ये बटन वहीं रहते हैं जहाँ आपने रखे।'}};
const t=k=>(L[LG]&&L[LG][k])||k;
function speak(x){try{const u=new SpeechSynthesisUtterance(x);u.lang=LG==='hi'?'hi-IN':'en-IN';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){toast('Listening is not available here.')}}
function askHTML(){return S.cf?`<div class="card ask" role="alertdialog"><b>${esc(S.cf[0])}</b><div class="row"><button class="btn" onclick="const f=S.cf[1];S.cf=null;f();render()">Yes</button><button class="ghost" onclick="S.cf=null;render()">No</button></div></div>`:''}
function nm(k,v){NM[k]=v.trim()||NM[k];sv('nm',JSON.stringify(NM));render()}
function famJoin(c){CODE=c;sv('code',c);if(unsub)unsub();if(!DB)return;unsub=DB.collection('fam/'+c+'/wishes').onSnapshot(q=>{q.docChanges().forEach(ch=>{const d=ch.doc.data(),id=ch.doc.id;if(ch.type==='removed'||!d){delete WL[id];return}WL[id]=d;
if(ME!=='parent'||d.st!=='new'||SEEN[id])return;SEEN[id]=1;const n=cap(String(d.name||'').slice(0,30)),tx=String(d.text||d.name),ref=DB.doc('fam/'+c+'/wishes/'+id),from=String(d.from||NM.helper),
go=()=>{S.kept[n]={k:'wish',n,text:tx};add(n,from);ref.update({st:'done'}).catch(()=>{})};
if(AUTO){go();S.reply={t:from+' added the button "'+n+'". You can undo it in "What changed".'}}else mkProp(from,'Add the button "'+n+'"'+(d.text?': '+d.text:''),go,0,'',()=>ref.update({st:'no'}).catch(()=>{}))});render()},()=>toast('Could not connect.'))}
function famMake(){ME='parent';sv('me','parent');famJoin(String(100000+Math.floor(Math.random()*900000)));render()}
function famJoinUI(){const c=$('#fc').value.trim();if(c.length<4){toast('Type the code from the other phone.');return}ME='child';sv('me','child');famJoin(c);render()}
function wish(){const n=$('#wn').value.trim();if(!n){toast('Type a button name first.');return}DB.collection('fam/'+CODE+'/wishes').add({name:n,text:$('#wt').value.trim(),from:NM.helper,st:'new',ts:Date.now()}).then(()=>{toast('Sent. It appears after approval.');render()}).catch(()=>toast('Could not send.'))}
function famHTML(){if(!DB)return '<p class="mute">Connecting phones works when this page is opened from its shared Claude link.</p>';
return CODE&&ME==='parent'?`<div class="card"><b>Family code: <span style="font-size:1.6em">${esc(CODE)}</span></b><br><span class="mute">On your son or daughter's phone: open this same page, tap the arrows next to the name at the top, then type this code.</span></div><label><input type="checkbox" ${AUTO?'checked':''} onchange="AUTO=this.checked?1:0;sv('auto',AUTO)"> Add family buttons without asking me</label>`:'<div class="row"><button class="btn" onclick="famMake()">Make a family code</button></div>'}
function famPanel(){if(!DB)return '';if(ME==='child'&&CODE)return `<h2>Add a button on ${esc(NM.mom)}'s phone</h2><label>Button name<br><input id="wn" placeholder="Call Anna"></label><br><label>Note (optional)<br><input id="wt" placeholder="Anna: 98765 43210"></label><div class="row"><button class="btn" onclick="wish()">Send</button></div><h2>Sent</h2><ul>${Object.values(WL).sort((a,b)=>b.ts-a.ts).map(w=>`<li><span>${esc(w.name)}</span><b>${{new:'waiting',done:'added',no:'declined'}[w.st]||w.st}</b></li>`).join('')||'<li class="mute">Nothing sent.</li>'}</ul>`;
return `<h2>Connect to ${esc(NM.mom)}'s phone</h2><label>Family code<br><input id="fc" inputmode="numeric"></label><div class="row"><button class="btn" onclick="famJoinUI()">Connect</button></div>`}
async function famInit(){try{const c=window.claude;if(!c||!c.use)return;DB=await c.use('db');if(!DB)return;if(CODE)famJoin(CODE);if(ME==='child'){TOUR=false;S.role='helper';S.tab='helper'}render()}catch(e){}}
const FS=[1,1.25,1.5,2],cap=s=>s[0].toUpperCase()+s.slice(1);
const init=()=>({fs:0,skin:'',btns:['Call family','Photos','Weather'],hist:[],know:[],pend:[],sent:[],inbox:[],declined:false,upd:false,reply:null,live:null,msg:'',rules:[],today:new Date().getDay(),kept:{},edit:0,tab:'home',role:'mom',mic:false});
let S=init(),T,TI=0,TOUR=true;
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function addRule(what,day,src){if(S.rules.some(r=>r.what===what&&r.day===day))return;const r={what,day},t='on '+DAYS[day]+'s, show "'+what+'"';S.rules.push(r);S.know.push('Rule: '+t);return act('Saved: '+t,src,()=>{S.rules=S.rules.filter(x=>x!==r);S.know=S.know.filter(k=>k!=='Rule: '+t)})}
function shown(){return S.btns.map(b=>({b,why:''})).concat(S.rules.filter(r=>r.day===S.today).map(r=>({b:r.what,why:'Here because it is '+DAYS[r.day]+'. You made this rule.'})))}
function ruleParse(l){const d=l.match(/\b(sun|mon|tues|wednes|thurs|fri|satur)day/);if(!d)return;const day=['sun','mon','tues','wednes','thurs','fri','satur'].indexOf(d[1]),c=l.match(/call (?!someone|a )([a-z]+)/);const what=c?'Call '+cap(c[1]):/photo/.test(l)?'Photos':/weather/.test(l)?'Weather':null;return what&&{what,day}}
function rulesHTML(){return '<p class="mute">Today is '+DAYS[S.today]+'.</p>'+(S.rules.length?'<ul>'+S.rules.map((r,i)=>`<li><span>On ${DAYS[r.day]}s, show "${esc(r.what)}".</span><button class="ghost" onclick="rmRule(${i})">Remove</button></li>`).join('')+'</ul>':'<p class="mute">No rules yet. Press "Change my screen" and say, for example, "show call Anna on Sundays".</p>')}
function rmRule(i){const r=S.rules[i],t='on '+DAYS[r.day]+'s, show "'+r.what+'"',h=S.hist.find(x=>!x.done&&x.label==='Saved: '+t);if(h)undo(h);render()}
function act(label,src,undo){const h={label,src,undo,done:false};S.hist.unshift(h);return h}
function undo(h){if(h.done)return;h.undo();h.done=true}
function size(d,src){const p=S.fs,n=Math.min(3,Math.max(0,p+d));if(n===p)return;S.fs=n;return act(d>0?'Made the text bigger':'Made the text smaller',src,()=>S.fs=p)}
function calm(src){if(S.skin)return;S.skin='calm';return act('Switched to calmer colors',src,()=>S.skin='')}
function add(n,src){if(S.btns.includes(n))return;S.btns.push(n);S.know.push('You have a button: '+n);return act('Added the button "'+n+'"',src,()=>{S.btns=S.btns.filter(b=>b!==n);S.know=S.know.filter(k=>k!=='You have a button: '+n)})}
function del(n,src){S.btns=S.btns.filter(b=>b!==n);return act('Removed the button "'+n+'"',src,()=>S.btns.push(n))}
function screenChange(t){t=t.trim();if(!t)return;const l=t.toLowerCase();let r,m;
if(/undo|go back/.test(l)){const h=S.hist.find(x=>!x.done);if(h){undo(h);r={t:'Undone: '+h.label+'.'}}else r={t:'There is nothing to undo yet.'}}
else if(m=l.match(/rename (.+) to (.+)/)){const b=S.btns.find(x=>x.toLowerCase()===m[1].trim());if(b){const nn=cap(m[2].trim()),i=S.btns.indexOf(b);S.btns[i]=nn;if(S.kept[b]){S.kept[nn]=S.kept[b];S.kept[nn].n=nn}const h=act('Renamed "'+b+'" to "'+nn+'"','You',()=>{S.btns[S.btns.indexOf(nn)]=b});r={t:'Done. "'+b+'" is now "'+nn+'".',h}}else r={t:'I do not see that button.'}}
else if(m=l.match(/(?:put|move) (.+?) (?:first|to the top|up)/)){const b=S.btns.find(x=>l.includes(x.toLowerCase()));if(b){const i=S.btns.indexOf(b);S.btns.splice(i,1);S.btns.unshift(b);const h=act('Moved "'+b+'" to the top','You',()=>{S.btns.splice(S.btns.indexOf(b),1);S.btns.splice(i,0,b)});r={t:'Done. "'+b+'" is first.',h}}else r={t:'I do not see that button.'}}
else if(ruleParse(l)){const x=ruleParse(l),h=addRule(x.what,x.day,'You');r=h?{t:'Done. On '+DAYS[x.day]+'s, "'+x.what+'" shows up. On other days it does not.',h}:{t:'That rule already exists.'}}
else if(/bigger|larger|too small|can.t read/.test(l)){const h=size(1,'You');r=h?{t:'Done. The text is bigger.',h}:{t:'The text is as big as it goes. Do you want bigger buttons? Say so.'}}
else if(/smaller/.test(l)){const h=size(-1,'You');r=h?{t:'Done. The text is smaller.',h}:{t:'The text is already at its smallest.'}}
else if(/calm|soft|colou?r/.test(l)){const h=calm('You');r=h?{t:'Done. The colors are calmer.',h}:{t:'The colors are already calm.'}}
else if(m=l.match(/(?:remove|delete|take away)\s+(?:the\s+)?(.*)/)){const b=S.btns.find(x=>l.includes(x.toLowerCase())||x.toLowerCase().includes(m[1].replace(/ button/,'').trim()));if(b){const h=del(b,'You');r={t:'Done. "'+b+'" is gone.',h}}else r={t:'I do not see that button. Your buttons: '+S.btns.join(', ')+'.'}}
else if(m=l.match(/call (?!someone|a )([a-z]+)/)){const h=add('Call '+cap(m[1]),'You');r=h?{t:'Done. There is a "Call '+cap(m[1])+'" button.',h}:{t:'That button is already here.'}}
else if(/photo/.test(l)&&/add|button/.test(l)){const h=add('Photos','You');r=h?{t:'Done. Photos is on your screen.',h}:{t:'Photos is already here.'}}
else if(/add|button/.test(l)){r={t:'Who should the button call? Say a name.',chips:['Add a button to call Anna']}}
else if(/know|remember/.test(l)){S.tab='privacy';r={t:'Here is what I know. You can remove any line.'}}
else if(/forget/.test(l)){S.know=[];r={t:'Done. I forgot the notes about you. Your buttons and text size stay.'}}
else if(/gone|broken|not working|stuck|wrong|help/.test(l)){r={t:'I am sorry. I will not guess. I can send your helper this note: "Something looks wrong on my Home screen." Send it?',acts:[['Send note',()=>{S.inbox.push('Something looks wrong on my Home screen.');S.reply={t:'Sent. Alex will see it. Nothing else changes.'}}],['No',()=>S.reply={t:'Okay. I sent nothing.'}]]}}
else r={t:'I am not sure I understood. Did you mean one of these?',chips:['Make the text bigger','Show call Anna on Sundays','Calmer colors','What do you know about me?']};
S.reply=r;$('#in').value='';render()}
function mkProp(from,text,fn,sys,key,dn){const s={text,status:'waiting'};if(!sys)S.sent.unshift(s);S.pend.push({from,text,fn,s,sys,key,dn})}
function decide(i,ok){const p=S.pend.splice(i,1)[0];if(ok){p.fn();p.s.status='approved';S.reply={t:'Done. It is on your screen. Say "undo" to go back.'}}else{p.dn&&p.dn();p.s.status='declined';if(p.sys){S.dec=(S.dec||[]).concat(p.key);S.reply={t:'Okay. I will not ask about that again.'}}else S.reply={t:'Okay. I told Alex you said no.'}}render()}
function toast(m){clearTimeout(T);document.querySelectorAll('.toast').forEach(x=>x.remove());const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.append(e);e.setAttribute&&e.setAttribute('role','status');e.onclick=()=>e.remove();T=setTimeout(()=>e.remove(),10000)}
const OPTS=[['Make the text bigger',()=>size(1,'Alex (helper)')],['Add a Photos button',()=>add('Photos','Alex (helper)')],['Use calmer colors',()=>calm('Alex (helper)')]];
function handle(t){t=t.trim();if(!t)return;if(S.edit)return screenChange(t);const l=t.toLowerCase();let w;if(reshape(t,l)){$('#in').value='';render();return}
if(/weather|rain|temperature|मौसम|बारिश/.test(l))w={k:'weather',n:'Weather'};
else if(/%\s*of|\d\s*(\+|-|\*|x|times|plus|minus)\s*\d/.test(l)){let r='Tell me the numbers.',m=l.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/);if(m)r=m[1]+'% of '+m[2]+' is '+(+m[1]*+m[2]/100);else if(m=l.match(/(\d+(?:\.\d+)?)\s*(\+|-|\*|x|times|plus|minus)\s*(\d+(?:\.\d+)?)/)){const a=+m[1],c=+m[3],o=m[2];r=m[1]+' '+o+' '+m[3]+' = '+(/\+|plus/.test(o)?a+c:/-|minus/.test(o)?a-c:a*c)}w={k:'calc',n:'Calculator',res:r}}
else if(/shop|grocer|list|सूची|सामान/.test(l)){const it=(t.split(':')[1]||'').split(/,| and /).map(x=>x.trim()).filter(Boolean);w={k:'list',n:'Shopping list',items:(it.length?it:['Milk','Eggs','Bread']).map(x=>({t:cap(x),d:0}))}}
else if(/remind|pill|medic|appointment|दवा|याद/.test(l))w={k:'remind',n:'Reminder',what:t}
else if(/write|note|message|letter|चिट्ठी|संदेश/.test(l))w={k:'note',n:'Note'}
else{S.live=null;S.msg='I am not sure I understood. Try "shopping list: milk, eggs", "remind me at 8", "write a note to Anna", or "weather".';$('#in').value='';render();return}
S.live=w;S.msg='';$('#in').value='';render()}
function openTile(i){const b=shown()[i].b;if(S.kept[b]){S.live=JSON.parse(JSON.stringify(S.kept[b]));S.msg='';render()}else toast('Demo: this would open '+b)}
function keep(d){const w=S.live,n=w.n;if(d===undefined)d='';S.kept[n]=JSON.parse(JSON.stringify(w));if(d===''){if(S.btns.includes(n)){toast('Already on your screen.');return}const h=add(n,'You');h.label='Kept "'+n+'" on your screen'}else addRule(n,+d,'You');S.live=null;toast(d===''?'Kept. It is now on your screen.':'Saved as a rule for '+DAYS[+d]+'s.');render()}
function copyNote(){const t=document.querySelector('.live textarea');navigator.clipboard&&navigator.clipboard.writeText(t.value);toast('Copied.')}
function replyCard(){const r=S.reply;if(!r)return'';let h=`<div class="card" role="status"><b>${esc(r.t)}</b> <button class="ghost" data-s="${esc(r.t)}" onclick="speak(this.dataset.s)" aria-label="Listen">🔊</button>`;if(r.h&&!r.h.done)h+='<div class="row"><button class="ghost" onclick="undoLast()">Undo</button></div>';if(r.acts)h+='<div class="row">'+r.acts.map((a,i)=>`<button class="${i?'ghost':'btn'}" onclick="runAct(${i})">${a[0]}</button>`).join('')+'</div>';if(r.chips)h+='<div class="row">'+r.chips.map(c=>`<button class="chip" onclick="handle(this.textContent)">${esc(c)}</button>`).join('')+'</div>';return h+'</div>'}
function liveHTML(){const w=S.live;
if(!w)return`<p>${esc(S.msg||'Ask for something. This area takes the shape of your request.')}</p><div class="row">`+['Shopping list: milk, eggs, tea','Remind me to take my pills at 8','Write a note to Anna','What is the weather?','What is 15% of 80?'].map(c=>`<button class="chip" onclick="handle(this.textContent)">${c}</button>`).join('')+'</div>';
let b=`<p><b>${esc(w.n)}</b></p>`;
if(w.k==='weather')b+='<p>Today: 14°C. Light rain after 3 pm. Take an umbrella.</p><p class="mute">Demo data.</p>';
if(w.k==='calc')b+=`<p style="font-size:1.4em">${esc(w.res)}</p>`;
if(w.k==='list')b+=w.items.map((x,i)=>`<label><input type="checkbox" ${x.d?'checked':''} onchange="S.live.items[${i}].d=this.checked">${esc(x.t)}</label>`).join('');
if(w.k==='remind'){const m=w.what.match(/\b(\d{1,2})\b/),H=m?+m[1]:8;b+=`<p>${esc(w.what)}</p>`+(w.ap?`<p style="font-size:1.3em"><b>${H}:00 ${w.ap}</b> · every day</p><div class="row">${w.set?`<button class="btn" onclick="S.live.tk=!S.live.tk;render()">${w.tk?'✔ Taken today':'Mark as taken'}</button>`:`<button class="btn" onclick="S.live.set=1;toast('Reminder is on: every day at ${H}:00 ${w.ap}. Demo only.');render()">Set reminder</button>`}<button class="ghost" onclick="S.live.ap=0;S.live.set=0;render()">Change AM/PM</button></div>`:`<p><b>${H}: ${t('Morning')} or ${t('Evening')}?</b></p><div class="row"><button class="btn" onclick="S.live.ap='am';render()">${t('Morning')} (am)</button><button class="btn" onclick="S.live.ap='pm';render()">${t('Evening')} (pm)</button></div>`)}
if(w.k==='wish')b+=`<p style="font-size:1.3em">${esc(w.text)}</p><div class="row"><button class="ghost" data-s="${esc(w.text)}" onclick="speak(this.dataset.s)">🔊 ${t('Listen')}</button></div>`;
if(w.k==='note')b+='<textarea rows="5" aria-label="Your note">Dear Anna,\n\n</textarea><div class="row"><button class="ghost" onclick="copyNote()">Copy</button></div>';
return b+(w.k==='wish'?`<div class="row"><button class="btn" onclick="S.live=null;render()">${t('Done')}</button></div>`:w.pick?`<p><b>Which day?</b></p><div class="row">${DAYS.map((d,i)=>`<button class="chip" onclick="keep(${i})">${d}</button>`).join('')}</div>`:`<div class="row"><button class="btn" onclick="keep('')">${t('Keep always')}</button><button class="ghost" onclick="S.live.pick=1;render()">${t('Keep on one day')}</button><button class="ghost" onclick="S.live=null;render()">${t('Done')}</button></div><p class="mute">Your screen did not change.</p>`)}
function home(){let h=askHTML();
S.pend.forEach((p,i)=>h+=`<div class="card ask"><b>${p.sys?'A suggestion':esc(p.from)+' suggests:'}</b><br>${esc(p.text)}<div class="row"><button class="btn" onclick="decide(${i},1)">Yes, do it</button><button class="ghost" onclick="decide(${i},0)">No thanks</button></div></div>`);
const rc=replyCard();if(!S.edit)h+=rc;
h+='<div class="static"><p class="tag">'+t('These buttons stay where you left them.')+'</p>'+shown().map((x,i)=>`<button class="card big" onclick="openTile(${i})">${esc(t(x.b))}${x.why?'<br><small class="mute">'+x.why+'</small>':''}</button>`).join('')+(S.edit?'<div class="row"><button class="btn" onclick="S.edit=0;S.reply=null;render()">'+t('Done')+'</button></div><p class="mute">Now type or say how it should change, for example "make the text bigger" or "show call Anna on Sundays".</p>'+rc+rulesHTML():'')+'</div>';
return h+`<div class="live morph"><p class="tag">Right now. This part changes with every request.</p>${liveHTML()}</div>`}
function setp(){return '<h2>'+t('Change my screen')+'</h2><div class="row"><button class="btn" onclick="S.edit=1;S.reply=null;S.tab=\'home\';render()">'+t('Change my screen')+'</button></div>'+rulesHTML()+'<h2>Family phone</h2>'+famHTML()+'<h2>Names</h2><div class="row"><label>You<br><input value="'+esc(NM.mom)+'" onchange="nm(\'mom\',this.value)"></label><label>Helper<br><input value="'+esc(NM.helper)+'" onchange="nm(\'helper\',this.value)"></label></div><h2>Phone update</h2>'+(S.upd?'<p class="mute">Up to date.</p>':'<div class="card">A safe phone update is ready. Your screen will look the same.<div class="row"><button class="ghost" onclick="upd()">Update my phone</button></div></div>')+'<h2>Demo tools</h2><p class="mute">Pretend today is:</p><div class="row">'+DAYS.map((d,i)=>`<button class="chip" style="${i===S.today?'border-color:var(--acc);font-weight:700':''}" onclick="S.today=${i};render()">${d.slice(0,3)}</button>`).join('')+'</div><div class="row"><button class="chip" onclick="week()">Skip a week</button><button class="chip" onclick="S=init();TOUR=false;render()">Start over</button><button class="chip" onclick="goto(0)">Replay tour</button></div><p class="mute">This demo is scripted. It has no real AI.</p>'}
function helper(){return famPanel()+(ME==='child'&&DB?'':helper0())}
function upd(){S.upd=true;act('Installed a security fix. The look did not change.','System',()=>{});S.reply={t:'Installed. Your screen looks the same.'};render()}
const PROPS=[['Call Anna',0,'called Anna on 3 Sundays'],['Photos',6,'opened Photos on 3 Saturdays']];
function week(){if(S.pend.some(p=>p.sys)){toast('Answer the suggestion first.');return}const p=PROPS.find(x=>!S.rules.some(r=>r.what===x[0]&&r.day===x[1])&&!(S.dec||[]).includes(x[0]));if(!p){toast('No pattern to suggest. I only ask when I see one.');return}mkProp('Steady','You '+p[2]+'. Make a rule: on '+DAYS[p[1]]+'s, show "'+p[0]+'"?',()=>addRule(p[0],p[1],'Suggestion'),1,p[0]);S.tab='home';render()}
function reshape(t,l){const w=S.live;if(!w)return;let ok=0,m;
if(w.k==='list')l.split(/,| and (?=add |remove )/).forEach(c=>{c=c.trim();if(m=c.match(/^add (.+)/)){w.items.push({t:cap(m[1].trim()),d:0});ok=1}else if(m=c.match(/^(?:remove|delete) (.+)/)){const n=m[1].trim(),k=w.items.length;w.items=w.items.filter(x=>x.t.toLowerCase()!==n);if(w.items.length<k)ok=1}});
if(w.k==='remind'&&(m=l.match(/\b(?:at|make it|change it to)\s*(\d{1,2})\b/))){w.what=/at \d{1,2}/.test(w.what)?w.what.replace(/at \d{1,2}/,'at '+m[1]):w.what+' at '+m[1];ok=1}
if(m=l.match(/^call it (.+)/)){w.n=cap(m[1].trim());ok=1}
return ok}
const STEPS=[
{cap:"This is Mom's screen. The top part follows her rules. It never changes by itself.",run(){}},
{say:'Shopping list: milk, eggs, tea',cap:'The bottom part takes the shape of her request. The top part did not change.',run(){handle('Shopping list: milk, eggs, tea')}},
{say:'Add bread and remove tea',cap:'She reshapes it by talking. No menus.',run(){handle('Add bread and remove tea')}},
{say:'Milk is done. I am finished.',cap:'She ticks milk and presses Done. The shape goes away.',run(){S.live.items[0].d=1;S.live=null}},
{say:'Remind me to take my pills at 8',cap:'A new request gets a new shape.',run(){handle('Remind me to take my pills at 8')}},
{say:'Make it 9',cap:'Same shape, new time.',run(){handle('Make it 9')}},
{say:'Keep it. Always.',cap:'She keeps the reminder. It is now a button. She chose this. Steady did not.',run(){keep()}},
{say:'Change my screen: make the text bigger',cap:'To change the top part, she says so first. She can undo.',run(){S.edit=1;screenChange('make the text bigger')}},
{say:'Undo',cap:'She does not like it. Undo restores the old look.',run(){screenChange('undo')}},
{say:'Put Reminder first',cap:'She moves her reminder to the top.',run(){screenChange('put reminder first')}},
{who:'Alex (helper)',say:'Suggest: make the text bigger',cap:'Alex, her helper, sends a suggestion from his phone. It waits for her yes.',run(){S.edit=0;S.reply=null;S.role='helper';S.tab='helper';suggest(0)}},
{say:'Yes, do it',cap:'Mom reads it in plain words and approves.',run(){S.role='mom';S.tab='home';decide(0,1)}},
{say:'Show call Anna on Sundays',cap:'She makes a rule in her own words. Steady writes it out in plain words.',run(){S.edit=1;screenChange('show call Anna on Sundays')}},
{cap:'It is Sunday. "Call Anna" shows up, with the reason. On other days it is gone.',run(){S.edit=0;S.reply=null;S.today=0}},
{cap:'A week later, Steady sees a pattern. It asks. It does not act.',run(){S.edit=0;S.reply=null;S.today=1;week()}},
{say:'No thanks',cap:'No is final. Steady will not ask again.',run(){decide(0,0)}},
{say:'What do you know about me?',cap:'She sees what Steady knows. She can forget any line.',run(){S.tab='privacy'}},
{cap:'That is all. Steady sends no reminders to come back and keeps no streaks.',run(){S.tab='home'}}];
function drawStory(){const e=$('#story');if(!TOUR){e.style.display='none';return}const st=STEPS[TI],last=TI===STEPS.length-1;e.style.display='block';e.innerHTML=`<small class="mute">Step ${TI+1} of ${STEPS.length}</small>${st.say?`<div class="say"><b>${esc(st.who||NM.mom)}:</b> “${esc(st.say)}”</div>`:''}<div>${esc(st.cap)}</div><div class="row"><button class="ghost" ${TI?'':'disabled'} onclick="goto(TI-1)">Back</button><button class="btn" onclick="${last?'exitTour()':'goto(TI+1)'}">${last?'Try it yourself':'Next'}</button>${last?'':'<button class="ghost" onclick="exitTour()">Skip</button>'}</div>`}
function exitTour(){TOUR=false;S.tab='home';S.role='mom';S.edit=0;render()}
function goto(i){S=init();S.today=3;TOUR=true;TI=i;for(let k=0;k<=i;k++)STEPS[k].run();render()}
function undoLast(){const h=S.reply&&S.reply.h;if(h){undo(h);S.reply={t:'Undone: '+h.label+'.'}}render()}
function runAct(i){S.reply.acts[i][1]();render()}
function rec(){let h='<h2>What I did</h2><ul>'+(S.hist.length?S.hist.map(x=>`<li class="${x.done?'done':''}"><span>${esc(x.label)}<br><small class="mute">${esc(x.src)}${x.done?' (undone)':''}</small></span></li>`).join(''):'<li class="mute">Nothing yet. I do nothing unless you ask.</li>')+'</ul><h2>What you asked me to change</h2><ul>';
const a=S.hist.map((x,i)=>[x,i]).filter(([x])=>!x.done&&x.src!=='System');h+=a.length?a.map(([x,i])=>`<li><span>${esc(x.label)}</span><button class="ghost" onclick="rm(${i})">Remove</button></li>`).join(''):'<li class="mute">No changes. Your screen is the original.</li>';return h+'</ul>'}
function rm(i){undo(S.hist[i]);render()}
function priv(){let h=askHTML()+`<div class="card"><b>The microphone is ${S.mic?'on':'off'}.</b><br>It turns on only when you press Talk. It turns off when you stop.</div><div class="card"><b>I ask before I keep anything.</b><br>In this demo, notes stay in your browser.</div><h2>What I know about you</h2><ul>`;
h+=S.know.length?S.know.map((k,i)=>`<li><span>${esc(k)}</span><button class="ghost" onclick="S.know.splice(${i},1);render()">Forget</button></li>`).join(''):'<li class="mute">Nothing. Try adding a button, then look again.</li>';return h+'</ul>'+(S.know.length?'<div class="row"><button class="ghost" onclick="S.cf=[\'Forget everything I know about you?\',()=>S.know=[]];render()">Forget everything</button></div>':'')}
function helper0(){let h='<p class="mute">You are Alex, the helper. Send a suggestion. Mom decides.</p><h2>Suggest a change</h2>';
OPTS.forEach((o,i)=>h+=`<button class="card big" onclick="suggest(${i})">${o[0]}</button>`);
h+='<h2>Sent</h2><ul>'+(S.sent.length?S.sent.map(s=>`<li><span>${esc(s.text)}</span><b>${s.status}</b></li>`).join(''):'<li class="mute">Nothing sent.</li>')+'</ul><h2>Notes from Mom</h2><ul>'+(S.inbox.length?S.inbox.map(n=>`<li><span>${esc(n)}</span></li>`).join(''):'<li class="mute">No notes.</li>')+'</ul><p class="mute">Switch to Mom to approve.</p>';return h}
function suggest(i){mkProp(NM.helper,OPTS[i][0]+'.',OPTS[i][1]);toast('Sent. Mom will see it.');render()}
function render(){const Q='#v button,#v input,#v textarea,#v select',fa=document.activeElement,ix=fa?[...document.querySelectorAll(Q)].indexOf(fa):-1,sc=$('#v').scrollTop;
document.documentElement.dataset.skin=S.skin;document.documentElement.dataset.hc=HC;document.documentElement.style.setProperty('--fs',FS[S.fs]);
const mom=S.role==='mom';$('#role').textContent=(mom?NM.mom:NM.helper)+' ⇄';$('#mic').textContent=S.mic?'Mic on':'Mic off';$('#mic').className='pill'+(S.mic?' on':'');$('#lg').textContent=LG==='hi'?'English':'हिन्दी';
const tabs=mom?[['home',t('Home')],['rec',t('What changed')],['privacy',t('My privacy')],['set',t('Settings')]]:[['helper',t('Helper')]];if(!tabs.some(x=>x[0]===S.tab))S.tab=tabs[0][0];
$('#nav').innerHTML=tabs.map(x=>`<button ${x[0]===S.tab?'aria-current="page"':''} onclick="S.tab='${x[0]}';render()">${x[1]}</button>`).join('');
$('#bar').style.display=mom&&S.tab==='home'&&!TOUR?'flex':'none';$('#talk').textContent=t('Speak');$('#go').textContent=t('Send');
$('#in').placeholder=t(S.edit&&S.tab==='home'?'How should your screen change?':'What do you need right now?');$('#v').innerHTML={home,rec,privacy:priv,helper,set:setp}[S.tab]();
if(S.tab!==lastTab){$('#v').scrollTop=0;lastTab=S.tab}else $('#v').scrollTop=sc;
if(ix>=0){const n=[...document.querySelectorAll(Q)][ix];n&&n.focus&&n.focus()}drawStory()}
$('#go').onclick=()=>handle($('#in').value);$('#in').onkeydown=e=>{if(e.key==='Enter')handle(e.target.value)};
$('#role').onclick=()=>{S.role=S.role==='mom'?'helper':'mom';S.tab=S.role==='mom'?'home':'helper';render()};
$('#talk').onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast('Voice is not available here. Please type.');return}
const r=new R();r.lang=LG==='hi'?'hi-IN':'en-IN';r.onstart=()=>{S.mic=true;render()};r.onend=()=>{S.mic=false;render()};r.onerror=()=>{S.mic=false;render()};r.onresult=e=>handle(e.results[0][0].transcript);r.start()};
$('#sm').onclick=()=>{size(-1,'You');render()};$('#bg').onclick=()=>{size(1,'You');render()};$('#hc').onclick=()=>{HC=HC?0:1;sv('hc',HC);render()};$('#lg').onclick=()=>{LG=LG==='hi'?'en':'hi';sv('lg',LG);render()};
famInit();goto(0);
