(function(){
  /* =========================================================
     BLOCO 0 — Escopo isolado (IIFE)
     Evita vazar variáveis para o escopo global (window).
     Tudo aqui dentro só existe enquanto a página está carregada.
     ========================================================= */

  /* Atalho para document.getElementById — usado à exaustão abaixo. */
  var $ = function(id){return document.getElementById(id)};

  /* Cores das fatias da barra/legenda. Devem casar com as CSS vars do tema. */
  var CORES = ["var(--s1)","var(--s2)","var(--s3)","var(--s4)"];

  /* Nomes exibidos na legenda e nas dicas. A ORDEM importa:
     índice 0..3 corresponde a banho, descarga, torneira, lavagem. */
  var NOMES = ["Banho","Descarga","Torneira","Lavagem de roupa"];

  /* Meta diária em litros por pessoa. Mude aqui para recalibrar todo o app. */
  var META = 110;

  /* IDs dos inputs de entrada (pessoas + 4 hábitos).
     A ORDEM define a ordem de leitura e de cálculo. */
  var ids = ["pessoas","banho","descarga","torneira","lavagem"];

  /* Sufixo de unidade mostrado ao lado de cada valor (min, x, etc.).
     Vazio = só o número. */
  var unid = {pessoas:"",banho:" min",descarga:"x",torneira:" min",lavagem:"x"};

  /* =========================================================
     BLOCO 1 — Cálculo principal
     Lê os inputs, calcula o consumo diário (L/pessoa),
     atualiza os números, a barra, a legenda e a dica.
     Chamado a cada "input" em qualquer campo.
     ========================================================= */
  function calcular(){
    /* 1.1 — Lê valores dos inputs e espelha cada um ao lado do próprio campo. */
    var v = {};
    ids.forEach(function(i){ v[i] = Number($(i).value); $("o-"+i).textContent = v[i] + unid[i]; });

    /* 1.2 — Consumo por hábito, em litros/dia por pessoa.
       Premissas (ajuste aqui se quiser mudar o modelo):
         - banho:   12 L por minuto de chuveiro
         - descarga: 6 L por descarga
         - torneira: 8 L por minuto aberta
         - lavagem: 90 L por ciclo, distribuído em 7 dias e
                    dividido pelo nº de pessoas (rateio) */
    var partes = [
      v.banho * 12,
      v.descarga * 6,
      v.torneira * 8,
      (v.lavagem * 90 / 7) / v.pessoas
    ];

    /* 1.3 — Total diário por pessoa (soma das partes). */
    var total = partes.reduce(function(a,b){return a+b},0);
    $("r-dia").textContent = Math.round(total);

    /* 1.4 — Total mensal da casa, em m³:
       litros/dia × pessoas × 30 dias ÷ 1000.
       .toFixed(1) + replace(".",",") formata com vírgula (pt-BR). */
    $("r-mes").textContent = (total * v.pessoas * 30 / 1000).toFixed(1).replace(".",",");

    /* 1.5 — Barra empilhada.
       A escala usa 125% da meta OU o total atual (o que for maior),
       para a barra nunca "estourar" visualmente. */
    var escala = Math.max(total, META * 1.25);
    $("barra").innerHTML = partes.map(function(p,i){
      return '<span style="width:'+(p/escala*100)+'%;background:'+CORES[i]+'"></span>';
    }).join("");

    /* 1.6 — Posiciona a linha da meta sobre a barra.
       Se estiver muito à direita (>70%), o rótulo vai para a
       esquerda (right) para não sair da tela. */
    var pos = META / escala * 100;
    $("meta-linha").style.left = pos + "%";
    $("meta-txt").style.left = pos > 70 ? "auto" : "calc("+pos+"% + 8px)";
    $("meta-txt").style.right = pos > 70 ? "calc("+(100-pos)+"% + 8px)" : "auto";

    /* 1.7 — Legenda: um <li> por hábito com cor, nome e litros. */
    $("legenda").innerHTML = partes.map(function(p,i){
      return '<li><i style="background:'+CORES[i]+'"></i>'+NOMES[i]+'<b>'+Math.round(p)+' L</b></li>';
    }).join("");

    /* 1.8 — Identifica o maior gasto (índice 0..3). */
    var maior = partes.indexOf(Math.max.apply(null, partes));
    var dica = $("dica");

    /* 1.9 — Mensagem contextual:
       - dentro da meta → classe "good", texto informativo;
       - acima da meta  → classe "bad", mostra excesso + ação
         específica para o maior gasto (array paralelo a NOMES). */
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

  /* =========================================================
     BLOCO 2 — Wiring dos inputs + primeira renderização
     Qualquer alteração em qualquer campo recalcula tudo.
     Chama calcular() uma vez no load para preencher a tela.
     ========================================================= */
  ids.forEach(function(i){ $(i).addEventListener("input", calcular); });
  calcular();

  /* =========================================================
     BLOCO 3 — Validação e envio do formulário de contato
     - Evita o submit padrão (recarregar a página).
     - Valida nome (>=3 letras), e-mail (regex simples) e
       mensagem (>=10 caracteres).
     - Cada erro é escrito em #e-<campo>; se tudo ok,
       mostra #ok e limpa o form.
     ========================================================= */
  var form = $("form");

  /* Helper: escreve a msg de erro no campo e retorna true se NÃO há erro.
     Uso: var ok = erro("nome", condicao ? "msg" : ""); */
  function erro(campo, msg){ $("e-"+campo).textContent = msg; return !msg; }

  form.addEventListener("submit", function(ev){
    ev.preventDefault();
    var nome = $("nome").value.trim(), email = $("email").value.trim(), msg = $("msg").value.trim();

    /* Cada "a/b/c" é true se o campo passou na validação. */
    var a = erro("nome",  nome.length  < 3  ? "Informe seu nome com pelo menos 3 letras." : "");
    var b = erro("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Informe um e-mail válido, como nome@exemplo.com.");
    var c = erro("msg",   msg.length   < 10 ? "Escreva pelo menos 10 caracteres." : "");

    /* Mostra a confirmação só se tudo passou; reseta o form. */
    $("ok").style.display = (a && b && c) ? "block" : "none";
    if(a && b && c) form.reset();
  });

  /* =========================================================
     BLOCO 4 — Tema claro/escuro
     - Ao carregar, tenta restaurar a preferência salva.
     - O botão #tema alterna entre "light" e "dark" no <html>
       (data-theme), considerando também a preferência do SO
       quando ainda não há tema salvo.
     - Persiste a escolha em localStorage (try/catch para o
       caso de cookies/bloqueio).
     ========================================================= */
  var raiz = document.documentElement;
  try { var salvo = localStorage.getItem("tema"); if(salvo) raiz.setAttribute("data-theme", salvo); } catch(e){}

  $("tema").addEventListener("click", function(){
    /* Descobre o tema atual: atributo explícito OU preferência do SO. */
    var escuro = raiz.getAttribute("data-theme") === "dark" ||
      (!raiz.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);

    var novo = escuro ? "light" : "dark";
    raiz.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema", novo); } catch(e){}
  });
})();
