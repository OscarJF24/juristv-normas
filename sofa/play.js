// ============================================================
// DESDE EL SOFÁ - CONTROLADOR MÓVIL EN LA NUBE (MQTT)
// Conexión directa y en tiempo real con la TV
// ============================================================

const BROKERS = [
  { host: "broker.emqx.io", port: 8084, path: "/mqtt" },
  { host: "broker.hivemq.com", port: 8884, path: "/mqtt" }
];
let currentBrokerIndex = 0;

let myPlayerId = 'p_' + Math.random().toString(16).substring(2, 10);
let roomCode = '';
let myName = '';
let selectedAvatar = '🇨🇴';
let myTotalScore = 0;
let myCurrentStreak = 0;
let mqttClient = null;

// Topic names
let topicTvToPhone = '';
let topicPhoneToTv = '';

// Screens
const screens = {
  join: document.getElementById('mobileJoinScreen'),
  waiting: document.getElementById('mobileWaitingScreen'),
  gamepad: document.getElementById('mobileGamepadScreen'),
  submitted: document.getElementById('mobileSubmittedScreen'),
  result: document.getElementById('mobileResultScreen'),
  gameover: document.getElementById('mobileGameOverScreen')
};

// Form DOM
const joinForm = document.getElementById('joinForm');
const roomCodeInput = document.getElementById('roomCodeInput');
const playerNameInput = document.getElementById('playerNameInput');
const avatarBtns = document.querySelectorAll('.avatar-btn');
const joinErrorMessage = document.getElementById('joinErrorMessage');

// Waiting DOM
const myDisplayAvatar = document.getElementById('myDisplayAvatar');
const myDisplayName = document.getElementById('myDisplayName');

// Gamepad DOM
const myScore = document.getElementById('myScore');
const myStreak = document.getElementById('myStreak');
const mobileQuestionTitle = document.getElementById('mobileQuestionTitle');
const padBtns = document.querySelectorAll('.pad-btn');
const mOptTexts = [
  document.getElementById('mOptText0'),
  document.getElementById('mOptText1'),
  document.getElementById('mOptText2'),
  document.getElementById('mOptText3')
];

// Result DOM
const resultCard = document.getElementById('resultCard');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultPoints = document.getElementById('resultPoints');
const resultTotalScore = document.getElementById('resultTotalScore');
const finalScoreVal = document.getElementById('finalScoreVal');

// Auto-fill room from QR scan
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    roomCodeInput.value = room.trim().toUpperCase();
    playerNameInput.focus();
  }
});

// Avatar selection
avatarBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    avatarBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedAvatar = btn.getAttribute('data-avatar');
    vibrate(20);
  });
});

function vibrate(pattern = 40) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

function showScreen(key) {
  Object.keys(screens).forEach(k => {
    if (screens[k]) {
      screens[k].classList.toggle('active', k === key);
    }
  });
}

// ------------------------------------------------------------
// MQTT CONNECTION & JOIN
// ------------------------------------------------------------
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  joinErrorMessage.textContent = '';

  roomCode = roomCodeInput.value.trim().toUpperCase();
  myName = playerNameInput.value.trim();

  if (!roomCode) {
    joinErrorMessage.textContent = 'Ingresa el código de la sala que ves en el TV.';
    return;
  }
  if (!myName) {
    joinErrorMessage.textContent = 'Ingresa tu apodo o nombre.';
    return;
  }

  topicTvToPhone = `desdeelsofa/rooms/${roomCode}/tv_to_phone`;
  topicPhoneToTv = `desdeelsofa/rooms/${roomCode}/phone_to_tv`;

  connectMqttAndJoin();
});

function connectMqttAndJoin() {
  const broker = BROKERS[currentBrokerIndex];
  joinErrorMessage.style.color = '#38bdf8';
  joinErrorMessage.textContent = 'Conectando con la TV...';
  const clientId = "Phone_" + myPlayerId;

  console.log("Conectando celular a:", broker.host, "puerto:", broker.port, "ruta:", broker.path);

  // NOTA CRÍTICA: Paho.MQTT.Client requiere 4 argumentos: host, port, path, clientId
  mqttClient = new Paho.MQTT.Client(broker.host, Number(broker.port), broker.path, clientId);

  mqttClient.onConnectionLost = function(responseObject) {
    console.warn("MQTT desconectado:", responseObject.errorMessage);
  };

  mqttClient.onMessageArrived = function(message) {
    try {
      const data = JSON.parse(message.payloadString);
      handleTvMessage(data);
    } catch (e) {
      console.error("Error leyendo mensaje de la TV:", e);
    }
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    keepAliveInterval: 30,
    onSuccess: function() {
      console.log("¡Celular conectado exitosamente a la nube!");
      joinErrorMessage.textContent = '';
      mqttClient.subscribe(topicTvToPhone, { qos: 1 });

      // Enviar solicitud de unión a la TV
      publishToTv({
        type: 'JOIN',
        id: myPlayerId,
        name: myName,
        avatar: selectedAvatar
      });

      myDisplayName.textContent = myName;
      myDisplayAvatar.textContent = selectedAvatar;
      showScreen('waiting');
      vibrate(50);
    },
    onFailure: function(err) {
      console.warn("Fallo broker actual, intentando alternativo:", err);
      currentBrokerIndex = (currentBrokerIndex + 1) % BROKERS.length;
      setTimeout(connectMqttAndJoin, 1500);
    }
  });
}

function publishToTv(payload) {
  if (!mqttClient) return;
  try {
    const msg = new Paho.MQTT.Message(JSON.stringify(payload));
    msg.destinationName = topicPhoneToTv;
    msg.qos = 1;
    mqttClient.send(msg);
  } catch (e) {
    console.error("Error enviando a la TV:", e);
  }
}

// ------------------------------------------------------------
// MESSAGES FROM TV
// ------------------------------------------------------------
function handleTvMessage(data) {
  if (data.type === 'NEW_QUESTION') {
    vibrate([30, 50, 30]);

    mobileQuestionTitle.textContent = data.question;
    myScore.textContent = myTotalScore.toLocaleString();
    myStreak.textContent = myCurrentStreak > 1 ? `🔥 x${myCurrentStreak}` : '';

    data.options.forEach((opt, idx) => {
      if (mOptTexts[idx]) mOptTexts[idx].textContent = opt;
    });

    padBtns.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });

    showScreen('gamepad');
  } else if (data.type === 'REVEAL') {
    if (data.playerId && data.playerId !== myPlayerId) return;

    myTotalScore = data.totalScore || 0;
    myCurrentStreak = data.streak || 0;
    resultTotalScore.textContent = myTotalScore.toLocaleString();

    if (data.isCorrect) {
      vibrate([60, 60, 100]);
      resultCard.className = 'result-card correct';
      resultIcon.textContent = '🎉';
      resultTitle.textContent = '¡Correcto!';
      resultPoints.textContent = `+${data.pointsEarned.toLocaleString()} pts`;
    } else {
      vibrate(120);
      resultCard.className = 'result-card wrong';
      resultIcon.textContent = '😢';
      resultTitle.textContent = '¡Uyyy casi!';
      resultPoints.textContent = '+0 pts';
    }

    showScreen('result');
  } else if (data.type === 'GAME_OVER') {
    finalScoreVal.textContent = myTotalScore.toLocaleString();
    vibrate([100, 50, 100, 50, 200]);
    showScreen('gameover');
  }
}

// Botones de respuesta
padBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const answerIdx = parseInt(btn.getAttribute('data-idx'), 10);
    vibrate(40);

    padBtns.forEach(b => {
      b.disabled = true;
      b.style.opacity = '0.5';
    });

    publishToTv({
      type: 'ANSWER',
      playerId: myPlayerId,
      answerIndex: answerIdx
    });

    showScreen('submitted');
  });
});
