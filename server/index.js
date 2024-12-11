const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let players = {};

io.on('connection', (socket) => {
  players[socket.id] = { x: 0, y: 0, name: null };

  socket.on('join', ({ name }) => {
    if (players[socket.id]) {
      const player = players[socket.id];
      player.name = name;
      socket.broadcast.emit('playerJoin', { name, x: player.x, y: player.y });
      socket.emit('nowPlayers', { data: players });
    }
  });

  socket.on('move', ({ x, y }) => {
    if (players[socket.id]) {
      const player = players[socket.id];
      player.x += x;
      player.y += y;
      io.emit('playerMove', player);
    }
  });

  socket.on('message', ({ message }) => {
    if (players[socket.id]) {
      io.emit('playerMessage', { name: players[socket.id].name, message });
    }
  });

  socket.on('shoot', ({ x, y, direction }) => {
    if (players[socket.id]) {
      const player = players[socket.id];
      io.emit('shooting', { name: player.name, x, y, direction });
    }
  });

  socket.on('kill', (name) => {
    let id = '-1';
    Object.entries(players).forEach(([key, value]) => {
      if (value.name === name) {
        id = key;
      }
    });
    if (players[id]) {
      delete players[id];
      io.emit('playerDead', { killer: players[socket.id].name, target: name });
    }
  });

  socket.on('disconnect', () => {
    if (players[socket.id]) {
      const name = players[socket.id].name;
      delete players[socket.id];
      io.emit('playerLeave', { name });
    }
  });
});

app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../lib', 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.status(200).send('그런건 없다.');
});

app.get('/users', (req, res) => {
  res.json({ count: Object.keys(players).length });
});

app.get('/main.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../lib/main.js'));
});

app.get('/module', (req, res) => {
  res.sendFile(path.join(__dirname, '../module/index.js'));
});

app.get('/:path', (req, res) => {
  const requestedPath = req.params.path;
  res.sendFile(path.join(__dirname, '../module', requestedPath));
})

app.get('/assets/:path', (req, res) => {
  const requestedPath = req.params.path;
  res.sendFile(path.join(__dirname, 'src', 'assets', requestedPath));
});

server.listen(3000, () => {
  console.log('Server listening on 3000');
});
