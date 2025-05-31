const maxAlvos = 6;
const alvo = 45;
const alvoCor = "#FF0000";
const maxHistorico = 10;

let erros = 0;
let tempoRestante = 15;
let acertos = 0;
let pontuacao = 0;
let porcentagem = 0;

let ultimosAcertos = 0;
let ultimosErros = 0;
let ultimaPorcentagem = 0;

let loopDoJogo;
let listaDeAlvos = [];
let listaVezesJogadas = [];
let historicoPontuacao = [];
let jogos = 0;
let jogoEstaAtivo = false;
let historicoDasPartidas = [];


const botaoIniciar = document.getElementById("iniciarButton");
const botaoVoltar = document.getElementById("voltarButton");
const botaoEstatisticas = document.getElementById("estatisticasButton");

const areaDoJogo = document.getElementById("gameArea");
const areaDeEstatisticas = document.getElementById("estatisticasArea");

const placarNaTela = document.getElementById("pontuacao");
const errosNaTela = document.getElementById("erros");
const tempoNaTela = document.getElementById("temporizador");
const porcentagemNaTela = document.getElementById("porcentagem");

const telaDeDesenho = document.getElementById("canvas");
const contexto = telaDeDesenho.getContext("2d");

let graficoBarraInstance;
let graficoLinhaInstance
let dados = {};

function iniciarJogo() {
  erros = 0;
  porcentagem = 0;
  acertos = 0;
  pontuacao = 0;
  tempoRestante = 15;
  jogoEstaAtivo = true;
  listaDeAlvos = [];

  atualizarPlacarNaTela();
  atualizarErrosNaTela();
  atualizarTempoNaTela();
  atualizarPorcentagem();

  areaDoJogo.style.display = "block";
  areaDeEstatisticas.style.display = "none";
  botaoIniciar.style.display = "none";
  botaoEstatisticas.style.display = "none";

  if (loopDoJogo) clearInterval(loopDoJogo);
  loopDoJogo = setInterval(atualizarJogo, 1000);

  for (let i = 0; i < maxAlvos; i++) {
    gerarNovoAlvo();
  }
  desenharAlvosNaTela();
}

function atualizarJogo() {
  if (!jogoEstaAtivo) return;

  tempoRestante--;
  atualizarTempoNaTela();

  if (tempoRestante <= 0) {
    finalizarJogo();
  }
}

function finalizarJogo() {
  jogos++;
  listaVezesJogadas.push(jogos);

  jogoEstaAtivo = false;
  clearInterval(loopDoJogo);
  listaDeAlvos = [];

  contexto.clearRect(0, 0, telaDeDesenho.width, telaDeDesenho.height);

  calcularPorcentagem();

  ultimosAcertos = acertos;
  ultimosErros = erros;
  ultimaPorcentagem = porcentagem;

  const partidaAtual = {
    acertos: acertos,
    pontuacao: pontuacao,
    erros: erros,
    precisao: parseFloat(porcentagem)
  };
  historicoDasPartidas.push(partidaAtual);
  historicoPontuacao.push(pontuacao);
  if (historicoDasPartidas.length > maxHistorico) {
    historicoDasPartidas.shift();
  }

  alert(`Fim de jogo!\nSua pontuação final foi: ${pontuacao}\nAcertos: ${acertos}\nErros: ${erros}\nPorcentagem: ${porcentagem}%`);

  const idDoUsuarioLogado = sessionStorage.getItem("ID_USUARIO");
  if (!idDoUsuarioLogado) {
    alert("Erro: ID do Usuário não encontrado na sessão. Por favor, faça login novamente.");

    placarNaTela.textContent = "Pontuação: 0";
    errosNaTela.textContent = "Erros: 0";
    tempoNaTela.textContent = "Tempo: " + 15 + "s";
    porcentagemNaTela.textContent = "Porcentagem: " + porcentagem + "%";

    botaoIniciar.style.display = "none";
    botaoEstatisticas.style.display = "none";
    areaDoJogo.style.display = "none";
    areaDeEstatisticas.style.display = "block";
    legenda.style.display = "block";

    atualizarKPIs();
    mostrarGrafico();
    mostrarGraficoEvol()
    return;
  }

  fetch('/estatisticas/registrarResultadoPartida', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idUsuario: parseInt(idDoUsuarioLogado),
      erros: erros,
      acertos: acertos,
      pontuacao: pontuacao
    })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(`Falha ao salvar resultado: ${response.status} - ${errData.error || errData.message || 'Erro desconhecido do servidor'}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("Resultado registrado com sucesso no backend:", data);
  })
  .catch(error => {
    console.error("Erro ao tentar registrar o resultado da partida:", error);
    alert("Houve um problema ao tentar salvar seu resultado: " + error.message);
  })
  .finally(() => {
    placarNaTela.textContent = "Pontuação: 0";
    errosNaTela.textContent = "Erros: 0";
    tempoNaTela.textContent = "Tempo: " + 15 + "s";
    porcentagemNaTela.textContent = "Porcentagem: " + porcentagem + "%";

    botaoIniciar.style.display = "none";
    botaoEstatisticas.style.display = "none";
    areaDoJogo.style.display = "none";
    areaDeEstatisticas.style.display = "block";
    legenda.style.display = "block";
    atualizarKPIs();
    mostrarGrafico();
    mostrarGraficoEvol()
  });
}

function gerarNovoAlvo() {
  if (!jogoEstaAtivo || listaDeAlvos.length >= maxAlvos) {
    return;
  }

  let novoAlvo;
  let tentativas = 0;
  const maximoDeTentativas = 10;

  do {
    const xAleatorio = Math.random() * (telaDeDesenho.width - 2 * alvo) + alvo;
    const yAleatorio = Math.random() * (telaDeDesenho.height - 2 * alvo) + alvo;

    novoAlvo = {
      x: xAleatorio,
      y: yAleatorio,
      alvo: alvo,
      cor: alvoCor
    };
    tentativas++;
  } while (verificarPosicao(novoAlvo) && tentativas < maximoDeTentativas);

  if (tentativas < maximoDeTentativas) {
    listaDeAlvos.push(novoAlvo);
  }
}

function verificarPosicao(alvoParaChecar) {
  for (let i = 0; i < listaDeAlvos.length; i++) {
    const alvoExistente = listaDeAlvos[i];

    const diferencaX = alvoParaChecar.x - alvoExistente.x;
    const diferencaY = alvoParaChecar.y - alvoExistente.y;
    const distancia = Math.sqrt(diferencaX * diferencaX + diferencaY * diferencaY);

    if (distancia < alvoParaChecar.alvo + alvoExistente.alvo + 5) {
      return true;
    }
  }
  return false;
}

function desenharAlvosNaTela() {
  if (!telaDeDesenho || !contexto) return;

  contexto.clearRect(0, 0, telaDeDesenho.width, telaDeDesenho.height);

  listaDeAlvos.forEach(function(alvo) {
    contexto.beginPath();
    contexto.arc(alvo.x, alvo.y, alvo.alvo, 0, Math.PI * 2);
    contexto.fillStyle = alvo.cor;
    contexto.fill();
  });
}

function tratarCliqueNaTela(evento) {
  if (!jogoEstaAtivo) return;

  const retanguloDaTela = telaDeDesenho.getBoundingClientRect();
  const cliqueX = evento.clientX - retanguloDaTela.left;
  const cliqueY = evento.clientY - retanguloDaTela.top;

  let acertouAlvo = false;

  for (let i = listaDeAlvos.length - 1; i >= 0; i--) {
    const alvoAtual = listaDeAlvos[i];

    const diferencaX = cliqueX - alvoAtual.x;
    const diferencaY = cliqueY - alvoAtual.y;
    const distanciaDoCliqueAoCentro = Math.sqrt(diferencaX * diferencaX + diferencaY * diferencaY);

    if (distanciaDoCliqueAoCentro < alvoAtual.alvo) {
      acertos++;
      pontuacao += 10;
      atualizarPlacarNaTela();

      listaDeAlvos.splice(i, 1);
      gerarNovoAlvo();

      acertouAlvo = true;
      break;
    }
  }

  if (!acertouAlvo) {
    erros++;
    pontuacao -= 10;
    if (pontuacao < 0) {
      pontuacao = 0;
    }

    atualizarErrosNaTela();
    atualizarPlacarNaTela();
  }

  desenharAlvosNaTela();
}

function calcularPorcentagem() {
  const total = acertos + erros;
  if(total > 0){
    porcentagem = ((acertos / total) * 100).toFixed(2);
  } else {
    porcentagem = 0;
  }
}

function atualizarPlacarNaTela() {
  placarNaTela.textContent = "Pontuação: " + pontuacao;
  atualizarPorcentagem();
}

function atualizarErrosNaTela() {
  errosNaTela.textContent = "Erros: " + erros;
  atualizarPorcentagem();
}

function atualizarTempoNaTela() {
  tempoNaTela.textContent = "Tempo: " + tempoRestante + "s";
}

function atualizarPorcentagem(){
  calcularPorcentagem();
  porcentagemNaTela.textContent = "Precisão: " + porcentagem + "%";
}

function atualizarKPIs() {
  const kpiAcertosElement = document.getElementById('kpiAcertos');
  const kpiErrosElement = document.getElementById('kpiErros');
  const kpiPorcentagemElement = document.getElementById('kpiPorcentagem');
  const kpiPontuacaoElement = document.getElementById('kpiPontuacao');


  if(ultimosAcertos <= 10){
    kpiAcertosElement.innerHTML = `Acertos: <span style="color: red;">${ultimosAcertos}</span>`;
  } else if (ultimosAcertos > 10 && ultimosAcertos <= 20){
    kpiAcertosElement.innerHTML = `Acertos: <span style="color: black;">${ultimosAcertos}</span>`;
  } else {
    kpiAcertosElement.innerHTML = `Acertos: <span style="color: green;">${ultimosAcertos}</span>`;
  }

  if (ultimaPorcentagem <= 50){
    kpiPorcentagemElement.innerHTML = `Precisão: <span style="color: red;">${ultimaPorcentagem}%</span>`;
  } else if (ultimaPorcentagem <= 70){
    kpiPorcentagemElement.innerHTML = `Precisão: <span style="color: black;">${ultimaPorcentagem}%</span>`;
  } else {
    kpiPorcentagemElement.innerHTML = `Precisão: <span style="color: green;">${ultimaPorcentagem}%</span>`;
  }

  if (ultimosErros > 10){
    kpiErrosElement.innerHTML = `Erros: <span style="color: red;">${ultimosErros}</span>`;
  } else {
    kpiErrosElement.innerHTML = `Erros: <span style="color: black;">${ultimosErros}</span>`;
  }

  for(var i = 0; i < historicoPontuacao.length; i++){
    pontuacaoAtual = historicoPontuacao[historicoPontuacao.length - 1];
    pontuacaoAnterior = historicoPontuacao[historicoPontuacao.length - 2];
    if(pontuacaoAtual < pontuacaoAnterior){
      kpiPontuacaoElement.innerHTML = `Pontuação: <span style="color: red;">${pontuacao}<span>`;
    } else {
      kpiPontuacaoElement.innerHTML = `Pontuação: <span style="color: green;">${pontuacao}<span>`;
    }
  } 
}

function mostrarGrafico(){
  const ctx = document.getElementById('myChart').getContext('2d');
  const dadosParaGrafico = {
    labels: ['Acertos', 'Erros'],
    datasets: [{
      label: 'Resultado da Partida',
      data: [ultimosAcertos, ultimosErros],
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  if (graficoBarraInstance) {
    graficoBarraInstance.destroy();
  }

  graficoBarraInstance = new Chart(ctx, {
    type: 'bar',
    data: dadosParaGrafico,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

const config = {
  type: 'line',
  data: dados,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Line Chart - Logarithmic'
      }
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
        type: 'logarithmic',
      }
    }
  },
};

function mostrarGraficoEvol(){
  const ctx2 = document.getElementById('graficoLinha').getContext('2d');

  const labels = historicoPontuacao.map((_, index) => `Partida ${index + 1}`);
  const dados = historicoPontuacao;

    if (graficoLinhaInstance) {
    graficoLinhaInstance.destroy();
  }

  graficoLinhaInstance = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pontuação por Partida',
        data: dados,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Evolução da Pontuação por Partida'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}


function inicio(){
  var inicioBtn = document.getElementById("menuButton");

  if(inicioBtn){
    window.location.href = "/index-logado.html";
  }
}

botaoIniciar.addEventListener("click", iniciarJogo);

botaoVoltar.addEventListener("click", function() {
  areaDeEstatisticas.style.display = "none";
  botaoIniciar.style.display = "block";
  botaoEstatisticas.style.display = "block";
  areaDoJogo.style.display = "none";
  legenda.style.display = "none";
});

botaoEstatisticas.addEventListener("click", function() {
  areaDeEstatisticas.style.display = "block";
  areaDoJogo.style.display = "none";
  botaoIniciar.style.display = "none";
  botaoEstatisticas.style.display = "none";
  legenda.style.display = "block";

  atualizarKPIs();
  mostrarGrafico();
  mostrarGraficoEvol();
});

telaDeDesenho.addEventListener("click", tratarCliqueNaTela);

const menuButton = document.getElementById("menuButton");
if (menuButton) {
    menuButton.addEventListener("click", inicio);
}