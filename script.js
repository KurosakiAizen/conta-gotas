(function(){
  var $ = function(id){return document.getElementById(id)};
  var CORES = ["var(--s1)","var(--s2)","var(--s3)","var(--s4)"];
  var NOMES = ["Banho","Descarga","Torneira","Lavagem de roupa"];
  var META = 110;
  var ids = ["pessoas","banho","descarga","torneira","lavagem"];
  var unid = {pessoas:"",banho:" min",descarga:"x",torneira:" min",lavagem:"x"};

  function calcular(){
    var v = {};
    ids.forEach(function(i){ v[i] = Number($(i).value); $("o-"+i).textContent = v[i] + unid[i]; });
    var partes = [
      v.banho * 12,
      v.descarga * 6,
      v.torneira * 8,
      (v.lavagem * 90 / 7) / v.pessoas
    ];
    var total = partes.reduce(function(a,b){return a+b},0);
    $("r-dia").textContent = Math.round(total);
    $("r-mes").textContent = (total * v.pessoas * 30 / 1000).toFixed(1).replace(".",",");

    var escala = Math.max(total, META * 1.25);
    $("barra").innerHTML = partes.map(function(p,i){
      return '<span style="width:'+(p/escala*100)+'%;background:'+CORES[i]+'"></span>';
    }).join("");
    var pos = META / escala * 100;
    $("meta-linha").style.left = pos + "%";
    $("meta-txt").style.left = pos > 70 ? "auto" : "calc("+pos+"% + 8px)";
    $("meta-txt").style.right = pos > 70 ? "calc("+(100-pos)+"% + 8px)" : "auto";

    $("legenda").innerHTML = partes.map(function(p,i){
      return '<li><i style="background:'+CORES[i]+'"></i>'+NOMES[i]+'<b>'+Math.round(p)+' L</b></li>';
    }).join("");

    var maior = partes.indexOf(Math.max.apply(null, partes));
    var dica = $("dica");
    if(total <= META){
      dica.className = "tip good";
      dica.textContent = "Dentro da meta de " + META + " L. Seu maior gasto é " + NOMES[maior].toLowerCase() + ".";
    } else {
      dica.className = "tip bad";
      var excesso = Math.round(total - META);
      var acao = ["Reduzir o tempo de banho ajuda mais.","Uma caixa acoplada economiza em cada descarga.","Feche a torneira ao escovar os dentes e ensaboar a louça.","Junte roupas e lave com a máquina cheia."][maior];
      dica.textContent = "Você passa " + excesso + " L da meta. Maior gasto: " + NOMES[maior].toLowerCase() + ". " + acao;
    }
  }
  ids.forEach(function(i){ $(i).addEventListener("input", calcular); });
  calcular();

  // formulário
  var form = $("form");
  function erro(campo, msg){ $("e-"+campo).textContent = msg; return !msg; }
  form.addEventListener("submit", function(ev){
    ev.preventDefault();
    var nome = $("nome").value.trim(), email = $("email").value.trim(), msg = $("msg").value.trim();
    var a = erro("nome", nome.length < 3 ? "Informe seu nome com pelo menos 3 letras." : "");
    var b = erro("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Informe um e-mail válido, como nome@exemplo.com.");
    var c = erro("msg", msg.length < 10 ? "Escreva pelo menos 10 caracteres." : "");
    $("ok").style.display = (a && b && c) ? "block" : "none";
    if(a && b && c) form.reset();
  });

  // tema
  var raiz = document.documentElement;
  try { var salvo = localStorage.getItem("tema"); if(salvo) raiz.setAttribute("data-theme", salvo); } catch(e){}
  $("tema").addEventListener("click", function(){
    var escuro = raiz.getAttribute("data-theme") === "dark" ||
      (!raiz.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    var novo = escuro ? "light" : "dark";
    raiz.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema", novo); } catch(e){}
  });
})();
