import{S as _,i as h,s as b,l as p,a as w,u as S,m as f,c as T,p as $,v as j,h as c,b as u,N as d,H as v,J as m,n as y,K as k}from"../../../chunks/index-e0186b66.js";async function q(s,e){if(typeof e.query=="object"){const t=new URLSearchParams(e.query);s=`${s}?${t.toString()}`,delete e.query}typeof e.body=="object"&&(e.headers={Accept:"application/json","Content-Type":"application/json"},e.body=JSON.stringify(e.body));const n=await fetch(s,e);if(n.ok){const t=await n.json();return console.log(t),t}throw new Error(n.statusText)}function K(s){let e,n,t,o,l,r;return{c(){e=p("input"),n=w(),t=p("button"),o=S("Spawn a Kitten")},l(a){e=f(a,"INPUT",{}),n=T(a),t=f(a,"BUTTON",{});var i=$(t);o=j(i,"Spawn a Kitten"),i.forEach(c)},m(a,i){u(a,e,i),d(e,s[0]),u(a,n,i),u(a,t,i),v(t,o),l||(r=[m(e,"input",s[2]),m(t,"click",s[1])],l=!0)},p(a,[i]){i&1&&e.value!==a[0]&&d(e,a[0])},i:y,o:y,d(a){a&&c(e),a&&c(n),a&&c(t),l=!1,k(r)}}}function N(s,e,n){let t="Test Kitten";async function o(){const r=await q("/api/kittens",{method:"POST",body:{name:t}});window.alert(`Successfully added a kitten named "${r.name}" to the database!`)}function l(){t=this.value,n(0,t)}return[t,o,l]}class J extends _{constructor(e){super(),h(this,e,N,K,b,{})}}export{J as default};
