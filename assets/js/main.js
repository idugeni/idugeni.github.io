// data-set-theme
document.addEventListener("DOMContentLoaded",()=>{let e=document.querySelectorAll("[data-set-theme]");e.forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-set-theme");document.documentElement.setAttribute("data-theme",t),console.log(`Theme changed to: ${t}`)})}),console.log(`${e.length} buttons found and event listeners attached.`)});

AOS.init();