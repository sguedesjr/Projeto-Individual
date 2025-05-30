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
let jogos = 0;
let jogoEstaAtivo = false;
let historicoDasPartidas = [];
const maxHistorico = 10;

const maxAlvos = 6;
const alvo = 45;
const alvoCor = "#FF0000";

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

botaoIniciar.addEventListener("click", iniciarJogo);

botaoVoltar.addEventListener("click", function() {
  areaDeEstatisticas.style.display = "none";
  botaoIniciar.style.display = "block";
  botaoEstatisticas.style.display = "block";
  areaDoJogo.style.display = "none";
});

botaoEstatisticas.addEventListener("click", function() {
  areaDeEstatisticas.style.display = "block";
  areaDoJogo.style.display = "none";
  botaoIniciar.style.display = "none";
  botaoEstatisticas.style.display = "none";

  atualizarKPIs();
  mostrarGrafico();
});

telaDeDesenho.addEventListener("click", tratarCliqueNaTela);

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
    alert("Fim de jogo!\nSua pontuação final foi: " + pontuacao + "\nAcertos: " + acertos + "\nErros: " + erros + "\nPorcentagem: " + porcentagem + "%"); 

    ultimosAcertos = acertos;
    ultimosErros = erros;
    ultimaPorcentagem = porcentagem;

    const partidaAtual = {
        acertos: acertos,
        pontuacao: pontuacao,
        erros: erros,
        precisao: porcentagem
    };

    historicoDasPartidas.push(partidaAtual);

    if (historicoDasPartidas.length > maxHistorico) {
      
        historicoDasPartidas.shift();
    }

    const idDoUsuarioLogado = sessionStorage.getItem("ID_USUARIO");

    if (!idDoUsuarioLogado) {
        alert("Erro: ID do Usuário não encontrado na sessão. Por favor, faça login novamente.");
        reiniciarInterfaceDoJogo(); 
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

        reiniciarInterfaceDoJogo();
    });
}


function reiniciarInterfaceDoJogo() {
  placarNaTela.textContent = "Pontuação: 0";
  errosNaTela.textContent = "Erros: 0";
  tempoNaTela.textContent = "Tempo: " + 15 + "s";
  porcentagemNaTela.textContent = "Porcentagem: " + porcentagem + "%"

  botaoIniciar.style.display = "none";
  botaoEstatisticas.style.display = "none";
  areaDoJogo.style.display = "none";
  areaDeEstatisticas.style.display = "block";
  atualizarKPIs();
  mostrarGrafico();
}

function gerarNovoAlvo() {
  if (!jogoEstaAtivo || listaDeAlvos.length >= maxAlvos) {
    return;
  }

  let novoAlvo;
  let tentativas = 0;
  const maximoDeTentativas = 50;

  do {
    const xAleatorio = Math.random() * (telaDeDesenho.width - 2 * alvo) + alvo;
    const yAleatorio = Math.random() * (telaDeDesenho.height - 2 * alvo) + alvo;

    novoAlvo = {
      x: xAleatorio,
      y: yAleatorio,
      raio: alvo,
      cor: alvoCor
    };
    tentativas++;
  } while (verificarPosicao(novoAlvo) && tentativas < maximoDeTentativas);

  listaDeAlvos.push(novoAlvo);
}

function verificarPosicao(alvoParaChecar) {
  for (let i = 0; i < listaDeAlvos.length; i++) {
    const alvoExistente = listaDeAlvos[i];

    if (alvoParaChecar == alvoExistente) continue;

    const diferencaX = alvoParaChecar.x - alvoExistente.x;
    const diferencaY = alvoParaChecar.y - alvoExistente.y;
    const distancia = Math.sqrt(diferencaX * diferencaX + diferencaY * diferencaY);

    if (distancia < alvoParaChecar.raio + alvoExistente.raio + 5) {
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
    contexto.arc(alvo.x, alvo.y, alvo.raio, 0, Math.PI * 2);
    contexto.fillStyle = alvo.cor;
    contexto.fill();
    contexto.closePath();
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

    if (distanciaDoCliqueAoCentro < alvoAtual.raio) {
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
  document.getElementById('kpiAcertos').innerText = `Acertos: ${ultimosAcertos}`;
  document.getElementById('kpiErros').innerText = `Erros: ${ultimosErros}`;
  document.getElementById('kpiPorcentagem').innerText = `Precisão: ${ultimaPorcentagem}%`;
}

  function mostrarGrafico(){
  const ctx = document.getElementById('myChart').getContext('2d');
  const dados = {
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

  if (window.myChartInstance) {
    window.myChartInstance.destroy();
  }

  window.myChartInstance = new Chart(ctx, {
    type: 'bar',
    data: dados,
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

  function inicio(){
    var inicio = document.getElementById("menuButton")

    if(inicio){
      window.location = "/index-logado.html";
    }
}