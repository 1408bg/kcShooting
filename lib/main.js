import {
  Canvas,
  Color,
  ColorKnot,
  TextKnot,
  BorderKnot,
  Duration,
  Group,
  Input,
  Vector,
  startCoroutine,
  stopCoroutine,
  waitForDuration,
  MouseButtons
} from '../module';

const canvas = new Canvas({
  root: document.querySelector('canvas'),
  initHTMLStyle: true,
  useDefaultStyle: true,
  useFullScreen: true
});

const socket = io();

let players = {};
let userName;
let user = null;
let isChatting = false;

function requestConnection() {
  const name = prompt('이름을 입력하세요');
  if (!name) return;
  userName = name;
  socket.emit('join', { name });
}

function createMessageBox() {
  const messageBorder = new BorderKnot({ x: -25, width: 80, height: 25, opacity: 0, color: Color.fromHex('#444444') });
  const messageText = new TextKnot({ x: -22, y: 10, maxWidth: 80, fontSize: 10, opacity: 0 });
  const messageBox = new Group({ y: -24, children: [messageBorder, messageText] });
  return messageBox;
}

function createPlayer(name, x = 0, y = 0) {
  const playerBody = new ColorKnot({ width: 25, height: 25, color: Color.fromHex('#FF0000') });
  const playerName = new TextKnot({ text: name, y: 36, fontSize: 12 });
  const messageBox = createMessageBox();
  const player = new Group({ children: [playerBody, playerName, messageBox] });
  player.position.set({ x, y });
  players[name] = player;
  player.isChatting = false;
  return player;
}

function createBullet(x, y, own) {
  const color = own ? Color.fromHex('#0000FF') : Color.fromHex('#FF0000');
  const bullet = new ColorKnot({ width: 5, height: 5, x, y, color });
  bullet.own = own;
  return bullet;
}

function showAlert(message) {
  const alertKnot = new TextKnot({ x: canvas.width/2 - 150, y: 25, text: message, fontSize: 27, opacity: 0 });
  canvas.addKnot(alertKnot);
  function *alertFading() {
    while (alertKnot.opacity < 0.9) {
      alertKnot.opacity += 0.01;
      yield null;
    }
    alertKnot.opacity = 1;
    yield waitForDuration(new Duration({ second: 1 }));
    while (alertKnot.opacity > 0.1) {
      alertKnot.opacity -= 0.01;
      yield null;
    }
    canvas.removeKnot(alertKnot);
  }
  stopCoroutine(alertFading.bind(this));
  startCoroutine(alertFading.bind(this));
}

function onPlayerJoin({ name, x, y }) {
  if (players[name]) return;
  const player = createPlayer(name, x, y);
  canvas.addKnot(player);
}

function onPlayerLeave({ name }) {
  if (!players[name]) return;
  canvas.removeKnot(players[name]);
  delete players[name];
}

function onNowPlayers({ data }) {
  for (const { name, x, y } of Object.values(data)) {
    if (name === null) continue;
    if (!players[name]) {
      const player = createPlayer(name, x, y);
      if (name === userName) {
        player.children[0].color = Color.fromHex('#0000FF');
        user = player;
      }
      players[name] = player;
      canvas.addKnot(player);
    }
  }
  startCoroutine(moving);
  startCoroutine(chatting);
  startCoroutine(shooting);
  startCoroutine(canvas.getDrawLoop());
}

function onPlayerMove({ name, x, y }) {
  if (!players[name]) return;
  const player = players[name];
  player.position.x = x;
  player.position.y = y;
}

function onPlayerMessage({ name, message }) {
  if (!players[name]) return;
  const player = players[name];
  const messageBox = player.children[2];
  const children = messageBox.children;
  player.isChatting = true;
  children[0].color = Color.fromHex('#000000');
  children[0].opacity = 1;
  children[1].text = message;
  children[1].opacity = 1;

  function* messageTimeout() {
    yield waitForDuration(new Duration({ second: 2 }));
    player.isChatting = false;
    children[0].color = Color.fromHex('#444444');
    while (children[0].opacity > 0.1) {
      if (player.isChatting) {
        children[0].opacity = 1;
        children[1].opacity = 1;
        break;
      }
      children[0].opacity -= 0.01;
      children[1].opacity -= 0.01;
      yield null;
    }
    children[0].opacity = 0;
    children[1].opacity = 0;
  }

  if (player.messageTimeout) stopCoroutine(player.messageTimeout);
  player.messageTimeout = startCoroutine(messageTimeout.bind(this));
}

function onShooting({ name, x, y, direction }) {
  const bullet = createBullet(x, y, name === userName);
  canvas.addKnot(bullet);

  function* bulletMoving() {
    const speed = 10;
    const isOwnBullet = bullet.own;
    while (
      bullet.position.x >= 0 &&
      bullet.position.x <= canvas.width &&
      bullet.position.y >= 0 &&
      bullet.position.y <= canvas.height
    ) {
      bullet.position.moveByAngle(direction, speed);
      if (isOwnBullet) {
        Object.entries(players).forEach(([name, player]) => {
          if (name !== userName && player.children[0].intersects(bullet)) {
            socket.emit('kill', name);
          }
        });
      }
      yield null;
    }
    canvas.removeKnot(bullet);
  }

  startCoroutine(bulletMoving.bind(this));
}

function onPlayerDead({ target, killer }) {
  if (target === userName) {
    alert('님죽음');
    location.reload();
  } else {
    showAlert(`${killer}가 ${target}을 죽임`);
    onPlayerLeave({ name: target });
  }
}

function movePlayer(vector) {
  const player = players[userName];
  if (!player) return;
  socket.emit('move', { x: vector.x, y: vector.y });
}

function* moving() {
  const moveSpeed = 4;
  const delay = new Duration({ milisecond: 50 });
  while (true) {
    while (isChatting) yield null;
    const force = Vector.zero;
    if (Input.getKey('a')) force.x -= moveSpeed;
    if (Input.getKey('d')) force.x += moveSpeed;
    if (Input.getKey('w')) force.y -= moveSpeed;
    if (Input.getKey('s')) force.y += moveSpeed;

    if (force.x !== 0 || force.y !== 0) movePlayer(force);
    yield waitForDuration(delay);
  }
}

function* shooting() {
  const shootCooldown = new Duration({ minute: 1 });
  let canShoot = true;

  while (true) {
    if (Input.getMouseButtonDown(MouseButtons.left) && canShoot) {
      canShoot = false;

      const direction = Input.getMousePosition()
      .copy()
      .subtract(user.position)
      .normalize();

      socket.emit('shoot', {
        x: user.position.x,
        y: user.position.y,
        direction: Math.atan2(direction.y, direction.x)
      });

      yield waitForDuration(shootCooldown);
      canShoot = true;
    }
    yield null;
  }
}

function* chatting() {
  let messageBuffer = '';
  function* createKeyArray() {
    for (let i = 48; i <= 122; i++) yield String.fromCharCode(i);
    yield ' ';
    yield '!';
  }
  while (true) {
    if (Input.getKeyDown('/')) {
      if (isChatting) {
        Input.ignoreLetterCase = true;
      } else {
        Input.ignoreLetterCase = false;
        messageBuffer = '';
      }
      isChatting = !isChatting;
    }
    if (isChatting) {
      for (const key of createKeyArray()) {
        if (Input.getKeyDown(key)) {
          messageBuffer += key;
          socket.emit('message', { message: messageBuffer });
        }
      }
      if (Input.getKeyDown('Backspace')) {
        if (Input.getKey('Control')) {
          const spaceIdx = messageBuffer.lastIndexOf(' ');
          if (spaceIdx === -1) messageBuffer = '';
          else messageBuffer = messageBuffer.slice(0, spaceIdx);
        } else messageBuffer = messageBuffer.substring(0, messageBuffer.length - 1);
        socket.emit('message', { message: messageBuffer });
      }
    }
    yield null;
  }
}

socket.on('playerJoin', onPlayerJoin);
socket.on('playerLeave', onPlayerLeave);
socket.on('nowPlayers', onNowPlayers);
socket.on('playerMove', onPlayerMove);
socket.on('playerMessage', onPlayerMessage);
socket.on('shooting', onShooting);
socket.on('playerDead', onPlayerDead);

window.addEventListener('beforeunload', (event) => {
  socket.disconnect();
  alert('연결이 끊겼으므로, 다시 접속할 것.');
  event.preventDefault();
});

Input.initialize();
Input.ignoreLetterCase = true;

requestConnection();
