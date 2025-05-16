let pontuacao = 0;
let erros = 0;
let tempoRestante = 30;

let loopDoJogo;
let listaDeAlvos = [];
let jogoEstaAtivo = false;

const MAXIMO_DE_ALVOS_NA_TELA = 6;
const RAIO_DO_ALVO = 45;
const COR_DO_ALVO = "#FF0000";

const botaoIniciar = document.getElementById("startButton");
const botaoVoltar = document.getElementById("backButton");
const botaoEstatisticas = document.getElementById("statsButton");
const areaDoJogo = document.getElementById("gameArea");
const areaDeEstatisticas = document.getElementById("statsArea");

const placarNaTela = document.getElementById("score");
const errosNaTela = document.getElementById("misses");
const tempoNaTela = document.getElementById("timer");

const telaDeDesenho = document.getElementById("gameCanvas");
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
});

telaDeDesenho.addEventListener("click", tratarCliqueNaTela);

function iniciarJogo() {
  pontuacao = 0;
  erros = 0;
  tempoRestante = 30;
  jogoEstaAtivo = true;
  listaDeAlvos = [];

  atualizarPlacarNaTela();
  atualizarErrosNaTela();
  atualizarTempoNaTela();

  areaDoJogo.style.display = "block";
  areaDeEstatisticas.style.display = "none";
  botaoIniciar.style.display = "none";
  botaoEstatisticas.style.display = "none";

  if (loopDoJogo) clearInterval(loopDoJogo);
  loopDoJogo = setInterval(atualizarJogo, 1000);

  for (let i = 0; i < MAXIMO_DE_ALVOS_NA_TELA; i++) {
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
  jogoEstaAtivo = false;
  clearInterval(loopDoJogo);
  listaDeAlvos = [];

  contexto.clearRect(0, 0, telaDeDesenho.width, telaDeDesenho.height);

  alert("Fim de jogo!\nSua pontuação final foi: " + pontuacao + "\nErros: " + erros);

  reiniciarInterfaceDoJogo();
}

function reiniciarInterfaceDoJogo() {
  placarNaTela.textContent = "Pontuação: 0";
  errosNaTela.textContent = "Erros: 0";
  tempoNaTela.textContent = "Tempo: " + 30 + "s";

  botaoIniciar.style.display = "block";
  botaoEstatisticas.style.display = "block";
  areaDoJogo.style.display = "none";
  areaDeEstatisticas.style.display = "none";
}

function gerarNovoAlvo() {
  if (!jogoEstaAtivo || listaDeAlvos.length >= MAXIMO_DE_ALVOS_NA_TELA) {
    return;
  }

  let novoAlvo;
  let tentativas = 0;
  const maximoDeTentativas = 50;

  do {
    const xAleatorio = Math.random() * (telaDeDesenho.width - 2 * RAIO_DO_ALVO) + RAIO_DO_ALVO;
    const yAleatorio = Math.random() * (telaDeDesenho.height - 2 * RAIO_DO_ALVO) + RAIO_DO_ALVO;

    novoAlvo = {
      x: xAleatorio,
      y: yAleatorio,
      raio: RAIO_DO_ALVO,
      cor: COR_DO_ALVO
    };
    tentativas++;
  } while (verificarSobreposicao(novoAlvo) && tentativas < maximoDeTentativas);

  listaDeAlvos.push(novoAlvo);
}

function verificarSobreposicao(alvoParaChecar) {
  for (let i = 0; i < listaDeAlvos.length; i++) {
    const alvoExistente = listaDeAlvos[i];

    if (alvoParaChecar === alvoExistente) continue;

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
      pontuacao++;
      atualizarPlacarNaTela();

      listaDeAlvos.splice(i, 1);
      gerarNovoAlvo();

      acertouAlvo = true;
      break;
    }
  }

  if (!acertouAlvo) {
    erros++;
    atualizarErrosNaTela();
  }

  desenharAlvosNaTela();
}

function atualizarPlacarNaTela() {
  placarNaTela.textContent = "Pontuação: " + pontuacao;
}

function atualizarErrosNaTela() {
  errosNaTela.textContent = "Erros: " + erros;
}

function atualizarTempoNaTela() {
  tempoNaTela.textContent = "Tempo: " + tempoRestante + "s";
}

reiniciarInterfaceDoJogo();