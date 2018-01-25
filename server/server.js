const fs = require("fs");//do otwierania plikow
const path = require('path');
const https = require('https');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
/////////////PEER//////////////
//var PeerServer = require('peer').PeerServer;
//var serverJS = PeerServer({port: 9000, path: '/myapp'});
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "localhost.key")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "localhost.cert"))
};
/////////////PEER////////////// 

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 8088;
var app = express();
var server = https.createServer(options, app);//tu przekazujemy opcje ssl
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));


io.on('connection', (socket) => {
  console.log('Dołączył nowy użytkownik: ');

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('wpradź login i nazwę pokoju.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    var clientIp =  socket.request.connection.remoteAddress;
    clientIp = clientIp.substring(7, clientIp.length);
    var peerId = params.pirek;
    
    users.addUser(socket.id, params.name, params.room, clientIp, peerId);
    
    ///
    mojID = socket.id;
    console.log("Wyświetl: ID = "+ mojID +"  IP =  "+ clientIp+"  PeerId: "+ peerId );
    //
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Witaj w komunikatorze 10wpdow. Twój adres IP to: '+clientIp));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} dołączył do rozmowy. Jego IP to:`+ clientIp));
    callback();
  });
  //////////////odebranie zmiany peera////
  socket.on('koniecRozmowy',(params, callback) => {
    ///////////////////
    // w param przyslac sockeid do wywalenia 
    //Dodac jeszcze metoda ktora pozwla na znalezienie i upgrade 

    //trza przemyslec!!!!!!!!!!!!!!!!!!!!!!!!!!!
    users.removeUser(socket.id); //wyrzucam user po id
    var peerId = params.pirek; // wpa
    
    users.addUser(socket.id, params.name, params.room, clientIp, peerId);

    ////////////////////
    var tabParam = params.split("$$");
    var idDoKogoDzwoni =tabParam[0]; //
    var nazwaTegoCoDzwoni = tabParam[1];  
    var peeridTegoDoKogoDzwoni = tabParam[2];
    var socketIdTegoKtoryZaczal = tabParam[3];
    console.log("----------Dzwoni: "+nazwaTegoCoDzwoni+" do: "+ idDoKogoDzwoni +"  a jego peeridto:"+peeridTegoDoKogoDzwoni);
    socket.broadcast.to(idDoKogoDzwoni).emit("serwerOdzwania",params);
   
    console.log("Serwer oddzwonił: "+idDoKogoDzwoni);
      callback();
  });
  ///////////////////////////////////////////////

  //////////////dzwonienie///////////
  socket.on('dzwoniDoServera',(params, callback) => {
    var tabParam = params.split("$$");
    var idDoKogoDzwoni =tabParam[0]; //
    var nazwaTegoCoDzwoni = tabParam[1];  
    var peeridTegoDoKogoDzwoni = tabParam[2];
    var socketIdTegoKtoryZaczal = tabParam[3];
    console.log("----------Dzwoni: "+nazwaTegoCoDzwoni+" do: "+ idDoKogoDzwoni +"  a jego peeridto:"+peeridTegoDoKogoDzwoni);
    socket.broadcast.to(idDoKogoDzwoni).emit("serwerOdzwania",params);
   
    console.log("Serwer oddzwonił: "+idDoKogoDzwoni);
      callback();
  });
  /////////////////////////////////
  socket.on('odebralemDzwonienie',(params, callback) => {
    console.log("odebralem dzwoninie  "+params);
    tabParam = params.split("$$");
    var peerIdJakieMaWywolacDoVideo =tabParam[0]
    var idTegoKtoryMaRozpoczacVideo= tabParam[1];
   console.log("PeertegoDokogo ma byc video: "+peerIdJakieMaWywolacDoVideo+
                "    Id tego zawodnika ktory rozpocznie video: "+idTegoKtoryMaRozpoczacVideo);
    console.log("Odzwania że dostał dzwonienie i jest gotow zapodawaj polaczenie   "+params);
    console.log(idTegoKtoryMaRozpoczacVideo);
    socket.broadcast.to(idTegoKtoryMaRozpoczacVideo).emit('zapodawajVideo',peerIdJakieMaWywolacDoVideo);//peerIdJakieMaWywolacDoVideo);
    console.log("Wysyła do tego co zaczał: "+ idTegoKtoryMaRozpoczacVideo+"  oraz peer z jakim mam zaczac video (wywołac) "+ peerIdJakieMaWywolacDoVideo);
    callback();
    console.log("AAAAAAAAAAAAAA------------------>????????????????")
  });
  //////////////////////////////////
  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {// czy istnieje user
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    } //wysyla info tylko pokoju w ktoryn jest user

    //callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} opuścil rozmowę`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server www bangla na: ${port}`);
});
var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000, 
  ssl: {
      key: fs.readFileSync(path.join(__dirname, "cert", "localhost.key")),
      cert: fs.readFileSync(path.join(__dirname, "cert", "localhost.cert"))
  },
  path: '/peerjs'});
  console.log("Peerjs bangla na 9000");
