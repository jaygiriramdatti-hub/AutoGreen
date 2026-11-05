'use strict';
const compareColors=['#168253','#739e22','#397e92'];
let comparisonRows=[];
function initFeatures(){
 const names=[...new Set(data.map(r=>r.state_ut))].sort(),options=names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
 ['compareA','compareB','compareC'].forEach(id=>{$(id).innerHTML=(id==='compareC'?'<option value="">None</option>':'')+options});
 $('compareA').value='Gujarat';$('compareB').value='Maharashtra';$('compareC').value='';
 function updateMonths(){const old=$('comparePeriod').value,max=+$('compareYear').value===2026?9:12;$('comparePeriod').innerHTML='<option value="all">All available months</option>'+months.slice(0,max).map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');$('comparePeriod').value=old&&+old<=max?old:'all'}
 $('compareYear').onchange=()=>{updateMonths();renderComparison();renderHeatmap()};
 ['compareA','compareB','compareC','comparePeriod'].forEach(id=>$(id).onchange=renderComparison);
 $('heatMode').onchange=renderHeatmap;$('compareExport').onclick=exportComparison;
 updateMonths();renderComparison();renderHeatmap();renderQuality();
}
function comparisonModel(){
 const year=+$('compareYear').value,period=$('comparePeriod').value,raw=['compareA','compareB','compareC'].map(id=>$(id).value).filter(Boolean),names=[...new Set(raw)];
 const national=data.filter(r=>r.year===year&&(period==='all'||r.month===+period)),denom=sum(national);
 return {year,period,raw,names,states:names.map(name=>{const rows=national.filter(r=>r.state_ut===name),reported=rows.filter(r=>r.registrations!==null),total=reported.length?sum(rows):null,peak=reported.length?reported.reduce((a,b)=>a.registrations>=b.registrations?a:b):null;return {name,rows,reported:reported.length,total,average:reported.length?total/reported.length:null,share:total!==null&&denom?100*total/denom:null,peak,growth:compare(rows).growth}})};
}
function renderComparison(){
 const model=comparisonModel(),{states,year,period,names,raw}=model;comparisonRows=states.flatMap(s=>s.rows);
 $('compareMessage').textContent=names.length<raw.length?'Duplicate selections are shown once. Choose different states for a side-by-side comparison.':`${year} · ${period==='all'?(year===2026?'January–September':'January–December'):months[+period-1]} · ${names.length} states / UTs`;
 $('compareCards').innerHTML=states.map((s,i)=>`<article class="compare-state" style="--state-color:${compareColors[i]}"><span class="eyebrow">STATE ${String.fromCharCode(65+i)}</span><h3>${esc(s.name)}</h3><strong>${s.total===null?'—':fmt(s.total)}</strong><p>Reported registrations</p><dl><div><dt>National share</dt><dd>${s.share===null?'—':s.share.toFixed(2)+'%'}</dd></div><div><dt>Matched YoY</dt><dd>${s.growth===null?'—':(s.growth>=0?'+':'')+s.growth.toFixed(1)+'%'}</dd></div><div><dt>Average / reported month</dt><dd>${s.average===null?'—':fmt(Math.round(s.average))}</dd></div><div><dt>Peak month</dt><dd>${s.peak?months[s.peak.month-1]:'—'}</dd></div><div><dt>Coverage</dt><dd>${s.reported}/${s.rows.length} months</dd></div></dl></article>`).join('');
 $('compareLegend').innerHTML=states.map((s,i)=>`<span><i style="background:${compareColors[i]}"></i>${esc(s.name)}</span>`).join('');
 const ms=period==='all'?Array.from({length:year===2026?9:12},(_,i)=>i+1):[+period];
 const vals=states.map(s=>ms.map(m=>s.rows.find(r=>r.month===m)?.registrations??null)),max=Math.max(1,...vals.flat().filter(v=>v!==null))*1.12,W=880,H=255,L=65,R=20,T=20,B=35,x=i=>L+(ms.length===1?(W-L-R)/2:i*(W-L-R)/(ms.length-1)),y=v=>H-B-v/max*(H-B-T);
 let svg='';for(let i=0;i<=4;i++){let v=max*i/4;svg+=`<line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}" stroke="#e8eee5"/><text x="${L-10}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="#738473">${short(Math.round(v))}</text>`}
 vals.forEach((series,j)=>{let path=series.map((v,i)=>v===null?'':`${!i||series[i-1]===null?'M':'L'} ${x(i)} ${y(v)}`).join(' ');svg+=`<path d="${path}" fill="none" stroke="${compareColors[j]}" stroke-width="3"/>`;series.forEach((v,i)=>{if(v!==null)svg+=`<circle cx="${x(i)}" cy="${y(v)}" r="4" stroke="white" stroke-width="1.5" fill="${compareColors[j]}"><title>${esc(states[j].name)} · ${months[ms[i]-1]}: ${fmt(v)}</title></circle>`})});ms.forEach((m,i)=>svg+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="11" fill="#738473">${months[m-1]}</text>`);
 $('compareChart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly state comparison. Exact values available in the table below.">${svg}</svg>`;
 $('compareValues').innerHTML=`<table><thead><tr><th>MONTH</th>${names.map(n=>`<th>${esc(n)}</th>`).join('')}</tr></thead><tbody>${ms.map((m,i)=>`<tr><td>${months[m-1]} ${year}</td>${vals.map(s=>`<td>${s[i]===null?'Missing':fmt(s[i])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 const common=ms.filter(m=>states.every(s=>s.rows.some(r=>r.month===m&&r.registrations!==null)));
 let message='Choose at least two different states to compare.';
 if(states.length>=2&&common.length){let ranked=states.map(s=>({name:s.name,total:sum(s.rows.filter(r=>common.includes(r.month)))})).sort((a,b)=>b.total-a.total),gap=ranked[0].total-ranked[1].total;message=gap?`${esc(ranked[0].name)} leads ${esc(ranked[1].name)} by <strong>${fmt(gap)}</strong> registrations across ${common.length} month(s) reported by every selected state.`:`The leading states are tied across ${common.length} shared reported month(s).`}
 else if(states.length>=2)message='No shared reported months are available for this selection. Missing values are not treated as zero.';
 $('compareInsight').innerHTML=`<span class="insight-icon">⇄</span><div><b>A fair comparison</b><p>${message}</p><p>Cards show each state's reported total. The comparison above uses only months reported by every selected state. National shares use all reported states in the selected period.</p></div>`;
}
function renderHeatmap(){
 const year=+$('compareYear').value,relative=$('heatMode').value==='relative',rows=data.filter(r=>r.year===year),names=[...new Set(rows.map(r=>r.state_ut))].sort(),allMax=Math.max(1,...rows.map(r=>r.registrations??0));
 $('heatNote').textContent=relative?`${year} · Colour intensity is relative to each state's highest month. Use this to see timing patterns, not compare state sizes.`:`${year} · All cells share the same scale. Darker cells have more registrations across the entire dataset year.`;
 $('heatTable').innerHTML=`<table><thead><tr><th>STATE / UT</th>${months.map(m=>`<th>${m}</th>`).join('')}</tr></thead><tbody>${names.map(name=>{let sr=rows.filter(r=>r.state_ut===name),max=relative?Math.max(1,...sr.map(r=>r.registrations??0)):allMax;return `<tr><td>${esc(name)}</td>${months.map((m,i)=>{let r=sr.find(x=>x.month===i+1),v=r?.registrations;if(!r)return '<td class="outside" title="Outside dataset coverage">N/A</td>';if(v===null)return '<td class="missing" title="Missing in source">—</td>';let intensity=v/max;return `<td style="background:hsl(143 32% ${96-intensity*64}%);color:${intensity>.6?'white':'#284b35'}" title="${esc(name)} · ${m} ${year}: ${fmt(v)}">${fmt(v)}</td>`}).join('')}</tr>`}).join('')}</tbody></table>`;
}
function renderQuality(){
 let missing=data.filter(r=>r.registrations===null),duplicates=data.length-new Set(data.map(r=>`${r.state_ut}|${r.year}|${r.month}`)).size;
 $('qualityStats').innerHTML=[['Reported records',fmt(data.length-missing.length)+' / '+fmt(data.length)],['Completeness',((data.length-missing.length)/data.length*100).toFixed(2)+'%'],['Missing values',missing.length],['Duplicate state-months',duplicates]].map(([label,v])=>`<div><span>${label}</span><strong>${v}</strong></div>`).join('');
 $('missingTable').innerHTML='<table><thead><tr><th>STATE / UT</th><th>YEAR</th><th>MONTH</th><th>STATUS</th></tr></thead><tbody>'+missing.map(r=>`<tr><td>${esc(r.state_ut)}</td><td>${r.year}</td><td>${months[r.month-1]}</td><td>Not present in source</td></tr>`).join('')+'</tbody></table>';
}
function exportComparison(){let header=['state_ut','year','month','registrations','data_status'],csv=[header,...comparisonRows.map(r=>[r.state_ut,r.year,r.month,r.registrations??'',r.data_status])].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n'),url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='AutoGreen_state_comparison.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
