Push.Permission.request();
var socket = io();

function scrollToBottom () {
  // Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child')
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}
var adresIPeer = window.location.href.split("/");
var messages = [];
var peer_id, name, conn;
var peer;
var tablicaRozmow = new Object();
var connectedPeers = {};
var idOknaDoKtoregoMatraficVideo;
//////////////////////////
var peerIdSocketowe;
socket.on('connect', function () {
  peerIdSocketowe = socket.id;
  utworzPeera(peerIdSocketowe);
  // alert("peeerid:  "+peerIdSocketowe);
  var test = window.location.search + "&pirek="+peerIdSocketowe; //rozboduwuje obiekt o dodatkowe "&pirek="+peer.id
  var params = jQuery.deparam(test);
  $("#jakSieNazwywam").html(params.name);//moja nazwa
   socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});
/////////////////peerjs
function utworzPeera(peerIdSocketoweprzekazane) {
    peer = new Peer(peerIdSocketoweprzekazane,{
    host: adresIPeer[2].substring(0, adresIPeer[2].length-5),//pobieram z www
    port: 9000,
    path: '/peerjs',
    debug: 3,
  });
    peer.on('open', function(){
     $('#id').text(peer.id);
    });
    peer.on('call', function(call){onReceiveCall(call);});
    peer.on('connection', connect);
    
    peer.on('error', function(err) {
      console.log(err);
    })
}

  function getVideo(callback){
    navigator.getUserMedia({audio: true, video: true}, callback, function(error){
      console.log(error);
      alert('An error occured. Please try again');
    });
  }

  getVideo(function(stream){
    window.localStream = stream;
    var video = $('#cam')[0];
    video.src = window.URL.createObjectURL(stream);
    window.peer_stream = stream;
  });
    ////////////////////////////////////////////////////////////////////////////////
   // ŁADOWACZKA STREAMU PO PROSTU DO OKNA VIDEO, BIERZE STREAM I NAZWE ELEMENTU //
  // I ŁADUJE VIDEŁO DO NIEGO                                                   //
 // DOROBIC NOWA FUNKCJE KTORA BEDZIE ZARZADZAŁA STREAMAMI ODEBRANYMI          //
////////////////////////////////////////////////////////////////////////////////
//function onReceiveStream(stream, element_id){
  function onReceiveStream(stream, peerid){ //tu trafia peer id tego co dzwoni a okno juz jest i 
   // console.log("---------->>>>>>>>"+'#' + element_id + ' video');
    
    var video = $('#video'+peerid)[0];// tu zrobić 
    console.log("---------------------To jest id video czy sie zgada????????????>>>>>>>> "+ '#video'+peerid);
    
    video.src = window.URL.createObjectURL(stream);
    window.peer_stream = stream;
  }
  function zakoncz(peerid){
    for (var szukanaRozmowa in tablicaRozmow){
      console.log(peerid.substring(6, peerid.length)+"    YYYYYYYYYYYYYYY----------"+szukanaRozmowa);      
      if(szukanaRozmowa === peerid.substring(6, peerid.length)){
        tablicaRozmow[szukanaRozmowa].close();
        console.log(peerid+"    YYYYYYYYYYYYYYY----------"+szukanaRozmowa+" ZAKONCZONO!!!!!!!!!!!!!!!!!!!");        
      }
    }
   }
  ////////////////////////////////////////////////////////////////////////////////
  //TU PRZYCHODZI ROZMOWA I TRZEBA ZROBIC ZEBY TRAFIAŁA DO ODPOWIEDNIEGO OKNA
  //okna powstają dynamicznie
  //do kona trzeba dynamicznie dowiązać
  //przekierowanie streamu po id
  //////////////////////////////////////////////////////////////////////////////
  function onReceiveCall(call){
    call.answer(window.localStream);
    call.on('stream', function(stream){
      window.peer_stream = stream;
      onReceiveStream(stream, idOknaDoKtoregoMatraficVideo);//podczas odbierania ustalam zmienna okna do ktorego ma to trafic i hukk
    });
  }
   /////////////////peerjs
  ///////////////////////////////////////////////
 ///////////////////////////////////////////////
///////////////////////////////////////////////

  // $('#call').click(function(){
  //   peer_id = $('#peer_id').val();
  //   console.log('now calling: ' + peer_id);
  //   console.log(peer);
  //   var call = peer.call(peer_id, window.localStream);
  //   call.on('stream', function(stream){
  //     window.peer_stream = stream;
  //     onReceiveStream(stream, 'camera1'); //jak dostanie stream to przesyła do diva camera1
  //   });
  // });
// Show this peer's ID.
// peer.on('open', function(id){
//   $('#pid').text(id);
// });

// Await connections from others


// Handle a connection object.
function connect(c) {
  var nazwaUzytkownikaWOkienku;
  uzytkownicy.forEach(function(uzytkownik) // ustawiam wyswietlanie nazwy zamiast ID
  {  
    var daneUzytkownika = uzytkownik.split("$$");
    if(c.peer === daneUzytkownika[1])
    {
      nazwaUzytkownikaWOkienku = daneUzytkownika[0];
    }  
  }, this);
  // Handle a chat connection.
  if (c.label === 'chat') {
    var idChatOkno = "chat"+c.peer;
    var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
    var header = $('<div></div>').html(nazwaUzytkownikaWOkienku ).addClass('nazwaZkim');
    var messages = $('<div></div>').addClass('messages');
    var divNaBatony = $('<div></div>').addClass('divNaBatony');
    var batonVideo = $('<button onclick="zadzwon(id)" id="'+c.peer+'" type="button">Video</button>').addClass('batonPolaczVideo');;
    var zakonczRozmowe = $('<button id="koniec'+c.peer+'" onclick="zakoncz(id)" type="button">Zakończ</button>').addClass('batonRozlaczVideo');    
    var batonZmiany =  $('<button id="zmiana'+c.peer+'" onclick="zakoncz(id)" type="button">Powieksz</button>').addClass('batonZmiany');
    var divNaVideo = $('<div></div>').addClass('divNavideo');
    
    var oknoVideo = $('<video id="video'+c.peer+'" autoplay></video>').addClass('oknoVideoDynamic');
    chatbox.append(header);
    
    divNaVideo.append(oknoVideo);
    divNaVideo.append(batonZmiany);     
    chatbox.append(divNaVideo);
    
    divNaBatony.append(batonVideo);
    divNaBatony.append(zakonczRozmowe);
      
    chatbox.append(divNaBatony);
    
    
    chatbox.append(messages);

     //alert("torba");
      Push.create('INFORMACJA Z SERWERA', {
      body: 'Do rozmowy dołaczył -'+nazwaUzytkownikaWOkienku,
      icon: 'img/logo.png',
      timeout: 100000,
      onClick: function() {
          console.log('Kliknięto powiadomienie.');
      }  
      });
     
    
    // Select connection handler.
    chatbox.on('click', function() {
      if ($(this).attr('class').indexOf('active') === -1) {
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
      $("#video"+c.peer).removeClass('blink');
    });
    $('.filler').hide();
    $('#connections').append(chatbox);

    c.on('data', function(data) {
      var formattedTime = moment(data.createdAt).format('HH:mm');
      
      messages.append('<div>'+formattedTime+'<span class="peer">' +" On: " + '</span>: ' + data +
        '</div>');
        $("#video"+c.peer).addClass('blink');
        var x = document.getElementById("gg"); 
        x.play();
        });

        c.on('close', function() {
          // alert(c.peer + ' rozłączył się.');
          chatbox.remove();
          if ($('.connection').length === 0) {
            $('.filler').show();
          }
          delete connectedPeers[c.peer];
        });
  } else if (c.label === 'file') {
    var nazwaPrzesylanegoPliku;
    c.on('data', function(data) {
      //najpierw  w ogole tu nie wchodzi
      console.log(data)
      
      if(data.constructor != ArrayBuffer){
        if(data.substring(0,2) === "$$"){
            nazwaPrzesylanegoPliku = data.substring(2, data.length);
            console.log("Nazwa pliku przesyłanego to: " +nazwaPrzesylanegoPliku)
        }
      }
      else{
          // If we're getting a file, create a URL for it.
          var nazwaDotestow = nazwaPrzesylanegoPliku;
          if (data.constructor === ArrayBuffer) {
                   var dataView = new Uint8Array(data);
                   var dataBlob = new Blob([dataView]);
                   dataBlob.type = "mp3";
                   console.log(dataBlob);
                   var plik = saveAs(dataBlob, nazwaDotestow);
                   //var myPlik = blobToFile(dataBlob, nazwaDotestow);
                   var myPlik = new File([dataBlob], nazwaDotestow);
                   console.log(myPlik);// var url = window.URL.createObjectURL(myPlik);                 
                  // $('#' + c.peer).find('.messages').append('<div><span class="file">' +
                  // c.peer + ' wysłał <a target="_blank" href="' + "//downloads/"+nazwaDotestow + '">"'+nazwaDotestow+'</a>.</span></div>');
      
                   $('#' + c.peer).find('.messages').append('<div><span class="file">' +
                   c.peer + ' wysłał <a/a>'+ nazwaDotestow+'</span></div>');
               }
      }
    });
  }
  connectedPeers[c.peer] = 1;
}

$(document).ready(function() {
  // Prepare file drop box.
  var box = $('#box');
  box.on('dragenter', doNothing);
  box.on('dragover', doNothing);
  box.on('drop', function(e){
    e.originalEvent.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
  
    console.log(file)
    var nazwaPliku = "$$"+ e.originalEvent.dataTransfer.files[0].name;
  //  alert(nazwaPliku);
    eachActiveConnection(function(c, $c) {
      if (c.label === 'file') {
        c.send(nazwaPliku);
        c.send(file);
        $c.find('.messages').append('<div><span class="file">Wysłałeś plik.</span></div>');
      }
    });
  });
  function doNothing(e){
    e.preventDefault();
    e.stopPropagation();
  }

  // ZESTAWIANIE POŁĄCZENIA
  $('#connect').click(function() {
    var requestedPeer = $('#rid').val();//TU WSTAWIC PEER ID TEGO Z KIM CHCE SIE LACZYĆ
    if (!connectedPeers[requestedPeer]) {
     // alert("a1");
      // Create 2 connections, one labelled chat and another labelled file.
      var c = peer.connect(requestedPeer, {
        label: 'chat',
        serialization: 'none',
        metadata: {message: 'Witam'}
      });
      console.log("AAAAAAAAAAAAAAAAAAAA=========="+c);
      c.on('open', function() {
        connect(c);
      });
      c.on('error', function(err) { alert(err); });
      var f = peer.connect(requestedPeer, { label: 'file', reliable: true });
      f.on('open', function() {
        connect(f);
      });
      f.on('error', function(err) { alert(err); });
    }
    connectedPeers[requestedPeer] = 1;
  });

  // Close a connection.
  $('#close').click(function() {
    eachActiveConnection(function(c) {
      c.close();
    });
  });

  // Send a chat message to all active connections.
  $('#send').submit(function(e) {
    e.preventDefault();
    // For each active connection, send the message.
    var msg = $('#text').val();
    eachActiveConnection(function(c, $c) {
      if (c.label === 'chat') {
        c.send(msg);
        var formattedTime = moment(msg.createdAt).format('HH:mm');
        
        $c.find('.messages').append('<div>'+formattedTime+'<span class="you"> Ja: </span>' + msg
          + '</div>');
          
      }
    });
    $('#text').val('');
    $('#text').focus();
  });

  // Goes through each active peer and calls FN on its connections.
  function eachActiveConnection(fn) {
    var actives = $('.active');
    var checkedIds = {};
    actives.each(function() {
      var peerId = $(this).attr('id');

      if (!checkedIds[peerId]) {
        var conns = peer.connections[peerId];
        for (var i = 0, ii = conns.length; i < ii; i += 1) {
          var conn = conns[i];
          fn(conn, $(this));
        }
      }

      checkedIds[peerId] = 1;
    });
  }

});

// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};
/////////////////peerjs
  ///////////////////////////////////////////////
 ///////////////////////////////////////////////
///////////////////////////////////////////////



socket.on('disconnect', function () {
  console.log('Disconnected from server');
});
var uzytkownicy = [];
var socketIdRozpoczynajacegoDzwonienie;
socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>');
  users.forEach(function (user) {
    console.log(user);
    uzytkownicy.push(user);
    var daneUsertab =user.split("$$");
    var nazwaPoka = daneUsertab[0];
    var idTegoDoKogoDzwonie = daneUsertab[1];    
    peerIdUsera= daneUsertab[2];
   // var $li = $('<li><span></span>'+nazwaPoka+" "+ "<div id="+"p"+idTegoDoKogoDzwonie+">"+idTegoDoKogoDzwonie+" "+idTegoDoKogoDzwonie+"</div>"+'<button onclick="zadzwon(id)" id="'+idTegoDoKogoDzwonie+'"class="Remove" type="button">VIDEO</button></li>');    
    var $li = $('<li><span></span>'+nazwaPoka+" "+ "<div id="+"p"+idTegoDoKogoDzwonie+">"+/*idTegoDoKogoDzwonie+" "+idTegoDoKogoDzwonie+*/"</div>"+'<button onclick="polacz(id)" id="'+idTegoDoKogoDzwonie+'"class="Remove" type="button">POŁĄCZ</button></li>');    
    ol.append($li);
        if(nazwaPoka === $("#jakSieNazwywam").text()  )
        {
          socketIdRozpoczynajacegoDzwonienie = daneUsertab[1];
          $('#idsocket').text(socketIdRozpoczynajacegoDzwonienie);
        }
  });

  jQuery('#users').html(ol);
});
////////////////////////////////////////
//TU WSTAWIAM ZESTAWIANIE POLACZENIA
////////////////////////////////////

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

////////////////////////////////////////
//STARE POŁACZENIE VIDEO


////////////////////////////////////
function zadzwon(id){
  //pobra id bstona
  var peerIdzBatona_video;
  var nazwaRozpoczynajacegoDzwonienie = $("#jakSieNazwywam").text()
  var IdRozpoczynajacegoDzwonienie = $('#idsocket').text();;
 uzytkownicy.forEach(function(uzytkownik) 
 {
   daneUzytkownika = uzytkownik.split("$$");
   if(daneUzytkownika[1] === id)
   {
    peerIdzBatona_video = daneUzytkownika[2]
   }  
 }, this);
// tu sa pobrane parametry batona jaki klikam, a w srod parametrow musze przekazaz
//dane tego ktory dzwoni
    var params = id + "$$"+nazwaRozpoczynajacegoDzwonienie+
                      "$$"+peerIdzBatona_video+
                      "$$"+IdRozpoczynajacegoDzwonienie;

    socket.emit('dzwoniDoServera', params, function () {
    pokaDoKogoDzwoni(peerIdzBatona_video);
    console.log("KLIKNALEM BATONA Z GOSCIEM DO KTOREGO DZWONIE:  " +params);
  });
}
var doKogoDzwonieG;
 function znajdzNazweUzytkownikaPoID(peerIdzBatona_video){
    uzytkownicy.forEach(function(uzytkownik){ // ustawiam wyswietlanie nazwy zamiast ID  
      var daneUzytkownika = uzytkownik.split("$$");
        // alert(daneUzytkownika[1]+"  dane przekazane to: "+idSzukanego);
        if(peerIdzBatona_video === daneUzytkownika[1])
        {
           doKogoDzwonieG = daneUzytkownika[0];
        }
    });
 }

function pokaDoKogoDzwoni(peerIdzBatona_video) {
  znajdzNazweUzytkownikaPoID(peerIdzBatona_video);
  var element = document.getElementById("pokaDoKogoDzwoni");
  element.classList.remove("ukryjKtoDzwoni");  
  element.classList.add("pokaKtoDzwoni");
  var element = document.getElementById("doKogoDzwoni");
  element.innerHTML = "Dzwoni do: "+ doKogoDzwonieG; //
  var x = document.getElementById("myAudio"); 
  x.play(); 
  setTimeout(function(){ukryjDoKogoDzwoni(x)},18000);
}
function ukryjDoKogoDzwoni(){
  var element = document.getElementById("pokaDoKogoDzwoni");
  element.classList.remove("pokaKtoDzwoni");  
  element.classList.add("ukryjKtoDzwoni");
  //var x = document.getElementById("myAudio"); 
  x.pause();
  x.currentTime = 0;
}
function anulujDzwonienie(){
  ukryjDoKogoDzwoni()
}
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

function polacz(id){
  //pobra id bstona
  var requestedPeer = id;//TU WSTAWIC PEER ID TEGO Z KIM CHCE SIE LACZYĆ
  if (!connectedPeers[requestedPeer]) {
   // alert("a1");
    // Create 2 connections, one labelled chat and another labelled file.
    var c = peer.connect(requestedPeer, {
      label: 'chat',
      serialization: 'none',
      metadata: {message: 'Witam'}
    });
    console.log("AAAAAAAAAAAAAAAAAAAA=========="+c);
    c.on('open', function() {
      connect(c);
    });
    c.on('error', function(err) { alert(err); });
    var f = peer.connect(requestedPeer, { label: 'file', reliable: true });
    f.on('open', function() {
      connect(f);
    });
    f.on('error', function(err) { alert(err); });
  }
  connectedPeers[requestedPeer] = 1;
    console.log("KLIKNALEM BATONA Z GOSCIEM DO KTOREGO DZWONIE:  " +id);
  
}

function jakieJestMojeId(mojaNazwa){
  users.forEach(function(user)
  {
    var mojeId;
    var nazwaPoka = user.substring(0, user.indexOf("$$"));    
    if(mojaNazwa === nazwaPoka)
    {
    return user.substring(0, user.indexOf("$$"));
    }
  });
}
var doKogo_z_Video;
var idSocketpodktoryMaPrzeslac;
var socketIdtegoKtoryzaczlaDzwonienie;
socket.on('serwerOdzwania', function (params){
  console.log("sERWER ODDZWANIA I TERAZ CZEKA NA KLIKNIECIE ODBIERZ:  "+params);//po id kto dzwoni
  //jezeli to id przyslane jest takie jak moje to odpowiadam!!!!!
  var tabParam = params.split("$$");
  var idDoKogoDzwoni = tabParam[0]; //
  var nazwaTegoCoDzwoni = tabParam[1];  
  var peeridTegoDoKogoDzwoni = tabParam[2];
  socketIdtegoKtoryzaczlaDzwonienie=tabParam[3];
  idSocketpodktoryMaPrzeslac = idDoKogoDzwoni;
  doKogo_z_Video = peeridTegoDoKogoDzwoni;

  console.log("AAAAAAATORBA Dzwoni: "+nazwaTegoCoDzwoni+" do: "+ peeridTegoDoKogoDzwoni+
              "  idsocket pod jaki ma przeslac sygnal ze ma dzwonic: "+ socketIdtegoKtoryzaczlaDzwonienie); 

    pokaUkryjKtoDzwoni();
    var element = document.getElementById("ktoDzwoni");
    element.innerHTML = "Dzwoni: "+ nazwaTegoCoDzwoni; //
    var x = document.getElementById("myAudio"); 
    x.play(); 
    setTimeout(function(){ukryjKtoDzwoni(x)},18000);
});

function pokaUkryjKtoDzwoni() {
  var element = document.getElementById("pokaKtoDzwoni");
  element.classList.remove("ukryjKtoDzwoni");  
  element.classList.add("pokaKtoDzwoni");
}
function ukryjKtoDzwoni(){
  var element = document.getElementById("pokaKtoDzwoni");
  element.classList.remove("pokaKtoDzwoni");  
  element.classList.add("ukryjKtoDzwoni");
  //var x = document.getElementById("myAudio"); 
  x.pause();
  x.currentTime = 0;
}
function odbierz(){
  console.log("Kliknąłem odbierz, a to jest peerId ktore wraca i ten co dzwoni ma nawiazac VIDEO: -------> "+doKogo_z_Video);
  var params = doKogo_z_Video+"$$"+socketIdtegoKtoryzaczlaDzwonienie;
  idOknaDoKtoregoMatraficVideo = socketIdtegoKtoryzaczlaDzwonienie;
  socket.emit('odebralemDzwonienie', params, function () 
    {
      console.log("ODBIERAM  " +params);
    });
    ukryjKtoDzwoni();
     // element.classList.remove("camera");  
                    // element.classList.add("cameraUkryta");
                    // element.classList.remove("cameraUkryta");  
                    // element.classList.add("camera");
                    }
            
  socket.on('zapodawajVideo', function (peerIdJakieMaWywolacDoVideo){

    // var element = document.getElementById("camera1");
    // element.classList.remove("cameraUkryta");  
    // element.classList.add("camera");
  
  console.log("Peer ID tego do kogo mam zestwic video: "+peerIdJakieMaWywolacDoVideo);//
  videoPolaczenie(peerIdJakieMaWywolacDoVideo); //szukam diva z  musze przeslac peerId
/////////peer
});
   ////////////////////////////////////////////////
  // zapisywanie obiektow rozmowy z kluczem     //
 // a kluczem jest PEERID tego z kim sie łącze //
////////////////////////////////////////////////

//window["functionName"](arguments);
//var call;
function videoPolaczenie(peerid){  
  peer_id = peerid;//.substring(3,peerid.lenght);// wywalicpeer na poczatku//$('#peer_id').val();
  console.log('BBBBBBBBBBBBBBBBBBBBBBBBBTeraz dzwonie: ' + peerid);
  console.log("CCCCCCCCCCCCCCCCCCCCCCCCCC"+peer);
  tablicaRozmow[peerid] =  peer.call(peerid, window.localStream);
  // np    peerid1 - obiekt rozmowa[peerid1]
  // np    peerid1 - obiekt rozmowa[peerid2]
  //
  // call = peer.call(peer_id, window.localStream);
  tablicaRozmow[peerid].on('stream', function(stream){
  window.peer_stream = stream;
  //
  //
  // tutaj przekazac peerid :))))))))))))))))))))))))))
  // onReceiveStream(stream, 'camera1');
  onReceiveStream(stream, peerid);
  //jak dostanie stream to przesyła do diva camera1
  });
  console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZ"+tablicaRozmow[peerid]);
  ukryjDoKogoDzwoni()
}
//////////////////////////////
  
  ukryjKtoDzwoni();
  //dodawanie okna video
  // var nazwaOknaVideo =  $("#ktoDzwoni").text().substring(8);
  // var video = $('<video />', {id: "video"+nazwaOknaVideo});
  // video.appendTo($('#bazavideo'));
//dodac klase pokazujaca video
// var element = document.getElementById("camera1");
// element.classList.remove("cameraUkryta");  
// element.classList.add("camera");

// function zakoncz(){
//    var element = document.getElementById("camera1");
//    element.classList.remove("camera");  
//    element.classList.add("cameraUkryta");
//    var staryPeerID = peer.id;
//   //peer.disconnect();
//   // window.peer_stream = stream;
//   $("#cam1").attr('src', '');
//   // $("#camera").stream(null);
//   // onReceiveStream(null, 'camera1');
//   //    peer = new Peer({
//   //    host: adresIPeer[2].substring(0, adresIPeer[2].length-5),//pobieram z www
//   //    port: 9000,
//   //    path: '/peerjs',
//   //    debug: 3,
//   //   });
//   //    peer.on('open', function(){
//   //    $('#id').text(peer.id); //generuje swoje nowe id i wyswietla
//   //    });
// /////////////////////////////////////
// //1. po rozlaczeniu do Servera zdarzenia
// //2. serwer do wszystkich emit rozsyla jeszcze raz uzytkownikow
// //       //ale najpierw trzeba znalezc tego co sie rozlaczyl po starym peerid i go upgrejdowac (peerID)
// // call.on("close", function(){
// //   console.log("zamykam...............")
// // });

// //PO KAZDYM ROZLACZENIU GENERUJE NOWEGO PEERA 
// //DURZUCIC JEGO ROZSYLANIE
  
// }
function odrzuc(){
  ukryjKtoDzwoni();
}
//////////////////////////////
socket.on('newMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('HH:mm');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('HH:mm');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();

  var messageTextbox = jQuery('[name=message]');

  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('')
  });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function () {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location.');
  });
});
function wycisz()
{
   var pobierzWyciszFull = document.getElementById("mikrofon").src;
   var pobierzWycisz = pobierzWyciszFull.substring(pobierzWyciszFull.length -16);
  if(pobierzWycisz === "/img/microON.jpg")
  {
  document.getElementById("mikrofon").src = "/img/microOFF.jpg"; 
    window.localStream.getAudioTracks()[0].enabled = !(window.localStream.getAudioTracks()[0].enabled);
 // window.localStream.getVideoTracks()[0].enabled = !(window.localStream.getVideoTracks()[0].enabled);
  }
  else
  {
    document.getElementById("mikrofon").src = "/img/microON.jpg";
      window.localStream.getAudioTracks()[0].enabled = !(window.localStream.getAudioTracks()[0].enabled);

  //  window.localStream.getVideoTracks()[0].enabled = !(window.localStream.getVideoTracks()[0].enabled);
    
  }
}
function wylaczVideo()
{
   var pobierzWyciszFull = document.getElementById("camera").src;
   var pobierzWycisz = pobierzWyciszFull.substring(pobierzWyciszFull.length -17);
  if(pobierzWycisz === "/img/cameraON.png")
  {
  document.getElementById("camera").src = "/img/cameraOFF.png"; 
    window.localStream.getVideoTracks()[0].enabled = !(window.localStream.getVideoTracks()[0].enabled);
  }
  else
  {
    document.getElementById("camera").src = "/img/cameraON.png";
      window.localStream.getVideoTracks()[0].enabled = !(window.localStream.getVideoTracks()[0].enabled);
    
  }
}


