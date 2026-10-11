const fs=require('fs');
const js=fs.readFileSync(__dirname+'/app.js','utf8');
try{new Function(js);console.log('syntax ok')}catch(e){console.log('ERR',e.message)}
// run the tour headless with a tiny DOM stub
const els={};const mk=()=>({value:'',style:{},innerHTML:'',textContent:'',className:'',placeholder:'',dataset:{},scrollTop:0,set onclick(f){},set onkeydown(f){}});
global.document={querySelector:s=>els[s]||(els[s]=mk()),querySelectorAll:()=>[],documentElement:{dataset:{},style:{setProperty(){}}},body:{append(){}},createElement:()=>mk()};
global.window={};global.navigator={};global.setTimeout=()=>0;global.clearTimeout=()=>{};
try{const f=new Function(js+';let out=[];for(let i=0;i<STEPS.length;i++){goto(i);out.push(i+":"+S.btns.join("|")+" rules="+S.rules.length+" live="+(S.live?S.live.k:"-")+" fs="+S.fs)}return out.join("\\n")');console.log(f())}catch(e){console.log('RUNERR',e.stack.split("\n").slice(0,3).join(" / "))}
