
$(document).ready(function() {
  
  //connect to the socket server.
  var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
  var socket1 = io.connect('http://' + document.domain + ':' + location.port + '/indeck');


  var numbers_received = [];
  var lastDate = 0;
  var data = [];

  //receive details from server
  socket.on('numbernumber', function(msg) {
    console.log("Received" + msg.number);


    //maintain a list of ten numbers
    if (numbers_received.length >= 5) {
      numbers_received.shift()
    }
    numbers_received.push(msg.number);
    numbers_string = '';
    for (var i = 0; i < numbers_received.length; i++) {
      numbers_string = numbers_string + '<p>' + numbers_received[i].toString() + '</p>';
    }
    if (i =  0){
    $('#log').html( numbers_received[0].toString() );
    }
    if (i =  1){
      $('#log1').html( numbers_received[1].toString() );
      }
      if (i =  2){
        $('#log2').html( numbers_received[2].toString() );
        }
        if (i =  3){
          $('#log3').html( numbers_received[3].toString() );
          }
          if (i =  4){
            $('#log4').html( numbers_received[4].toString() );
            }

  });


  

  });
  
 
  


