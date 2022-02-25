const express = require('express');
const venom = require('venom-bot');
const app  = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});

app.set("view engine", "ejs");

app.get('/home', (req, res) =>{
    res.render('home')
});

app.use(express.static(__dirname + '/images'));

server.listen(3001, () => {
    console.log('ouvindo da porta 3001')
})

io.on('connection', (socket) =>{
    console.log('Usuario conectado:' + socket.id);

    socket.on('message', () => {
        venom.create({
    session: 'crypto',
    catchQR: (base64Qr, asciiQR) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], 'base64');

      var imageBuffer = response;

      socket.emit('image', response.toString('base64'));

      require('fs').writeFile(
        './images/out.png',
        imageBuffer['data'],
        'binary',
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    
    logQR: false,
  })
  .then((cryptoClient) => {start(cryptoClient);})
  .catch((erro) => {console.log(erro);});

  function start(cryptoClient) {
    cryptoClient.onStateChange((state) => {
      socket.emit('message','status: ' + state);
      console.log('state changed: ', state);
      //socket.disconnect(true);
    });
    }
});

socket.on("ready", () =>{
    setTimeout(function () {
        socket.emit('ready', './out.png');
    }, 3000);
});
});
