/***********************************************************************************************/
//Серверная часть

$('.main_navigation ').css(
  'transition','none');

setTimeout(function() {
  $('.main_navigation ').css(
    'transition','transform 0.6s ease');
},1000);

var obj = {};
var data, dataCOM, select = document.getElementById("example-select"), checkingCOM = false, data = {}, speedInput = document.getElementById("speed-input");
var roll, cockpitNum = [];
var scanTest = {}, click = 1, matrix;
var socket = io(); 
var scan = document.getElementById("scan"), timer;
var text = document.getElementById('text'), head_window =  document.getElementById('head_window');

scanTest.test = 'check'
scanTest.number = 1;

setTimeout(function() {
  $('.window').css(
    'display','block');
  setTimeout(function () {
    $('.window').css(
      'opacity','1');
  }, 100);

  $('.overlay ').css(
    'display','block');
  setTimeout(function () {
    $('.overlay ').css(
      'opacity','0.7');
  }, 100);
}, 2000);


$(function(){

  $(window).scroll(function () {
    if ($(this).scrollTop() > 500) {
      $('.question').css("display:block");
      $('.question').fadeIn(1000);
    }
    else{
      $('.question').css("display:none");
      $('.question').fadeOut(300);
    }
  });


  quest.onclick = function(){
    head_window.innerHTML = "Остались какие-то вопросы? Не проблема!"
    text.innerHTML = "Для начала нужно выбрать порт, к которому подключена плата. Затем нажать на кнопку 'Запуск'. После этого установить датчик в первоначальное положение и нажать кнопку 'Начать сбор данных'. Ну, и последовательно менять положения дачика. В конце приложение выдаст готовую матрицу коэффициентов!";
    $('.window').css(
      'display','block');
    setTimeout(function () {
      $('.window').css(
        'opacity','1');
    }, 100);

    $('.overlay ').css(
      'display','block');
    setTimeout(function () {
      $('.overlay ').css(
        'opacity','0.7');
    }, 100);
  };


  $('.button_toggle').on('click',function(){
    //$('.main_navigation').toggleClass('open');
    $('.wrapper').toggleClass('open_menu');
  });

  scan.onclick = function(){
    move(scanTest.number);
    if(click<=6){
      $.ajax({
        type: 'POST',
        data: JSON.stringify(scanTest),
        contentType: 'application/json', 
        url: "http://localhost:3000",
        success: function(data) {
          console.log('sucsess');
        //console.log(data);
      }
    });

      click++;
      scanTest.number = click;
      timer = setTimeout(function() {
        if( click==7){
          clearInterval(timer);
          coeffMatrixSet();
          $('.section2 .log').css({
            display: 'none'
          });
          $('.section2 .block3 #matrix').css({
            display: 'block'
          });
          logInfo_text.innerHTML = "Калибровка завершена"
          $('.circle-loader').toggleClass('load-complete');
          $('.checkmark').toggle();
          setTimeout(function () {

            setTimeout(function () {
              $(function(){
               $('html, body').animate({
                scrollTop: $(".block3").offset().top
              }, 2000);
             });
            },1000);

            head_window.innerHTML = "Поздравляю!"
            text.innerHTML = "Калибровка датчика полностью закончена!";
            $('.window').css(
              'display','block');
            setTimeout(function () {
              $('.window').css(
                'opacity','1');
            }, 100);

            $('.overlay ').css(
              'display','block');
            setTimeout(function () {
              $('.overlay ').css(
                'opacity','0.7');
            }, 100);
          }, 1000);

        } 
        else {
          head_window.innerHTML = "Что делать дальше?"
          text.innerHTML = "Положите датчик в положение " + click + " и нажмите на кнопку 'Начать сбор данных'";
          $('.window').css(
            'display','block');
          setTimeout(function () {
            $('.window').css(
              'opacity','1');
          }, 100);

          $('.overlay ').css(
            'display','block');
          setTimeout(function () {
            $('.overlay ').css(
              'opacity','0.7');
          }, 100);
          document.getElementById('click_me').click();

        }
      }, 11000);
    }
  }




});



$('#button_window').on('click',function(){
  setTimeout(function () {
    $('.window').css(
      'display','none');
  }, 200);
  $('.window').css(
    'opacity','0');
  $('.overlay ').css(
    'display','none');
  setTimeout(function () {
    $('.overlay ').css(
      'opacity','0');
  }, 300);
});

$(function(){

  $('#clickCalaboration').click(function(){
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json', 
      url: "http://localhost:3000",
      success: function(data) {
        console.log('sucsess');
        //console.log(data);
      }
    });

    setTimeout(function () {
      $(function(){
       $('html, body').animate({
        scrollTop: $(".block1").offset().top
      }, 2000);
     });
    },1000);


    socket.on('input', function(angles){ 
      console.log(angles)
    });



    head_window.innerHTML = "Что делать дальше?"
    text.innerHTML = "Положите датчик в положение " + click + " и нажмите на кнопку 'Начать сбор данных'";
    $('.window').css(
      'display','block');
    setTimeout(function () {
      $('.window').css(
        'opacity','1');
    }, 100);

    $('.overlay ').css(
      'display','block');
    setTimeout(function () {
      $('.overlay ').css(
        'opacity','0.7');
    }, 100);
    document.getElementById('click_me').click();

    setTimeout(function () {
      scroll();
    },1000);



  });

  $('#open_button').on('click',function(){ 


    $('.wrapper').toggleClass('open_settings');

  });

  $('.proMode').on('click',function(){ 
    if($(this).is(":checked")) { $('.additionalSett').toggleClass('onDisplay') }
      else {$('.additionalSett').toggleClass('onDisplay')}
    });


});


function coeffMatrixSet(){
  let row = document.getElementsByClassName('row');
  let rowElements = document.getElementsByClassName('element');
  let coefficientMatrix = document.getElementsByClassName('coeff');
  let xhrReqMatrix = new XMLHttpRequest();
  xhrReqMatrix.open('GET', 'json/matrix.json', true);
  xhrReqMatrix.send(null);
  xhrReqMatrix.onreadystatechange = function() {
    if(this.status == 200) {
      matrix = JSON.parse(xhrReqMatrix.responseText);
      let y = 0;
      for( let i = 0; i < matrix.matrixReady.length; i++){
        if(i == 9){
          coefficientMatrix[y].innerHTML = '(' +  +matrix.matrixReady[i] + '';
          y++;
        }
        else if(i == 10) {
          coefficientMatrix[y].innerHTML = '' +  +matrix.matrixReady[i] + '';
          y++;
        }
        else if(i == 11) {
          coefficientMatrix[y].innerHTML = '' +  +matrix.matrixReady[i] + ')';
          y++;
        }
        else rowElements[i].innerHTML = '' +  +matrix.matrixReady[i] + '';
      }
      $(".bracketL").css("height", $('#matrix').height());
      $(".bracketR").css("height", $('#matrix').height());
      console.log(xhrReqMatrix.responseText); 
    }
  };
}


var xhrReq = new XMLHttpRequest();
xhrReq.open('GET', 'COM.json', true);
xhrReq.send(null);
xhrReq.onreadystatechange = function() {
  if(this.status == 200) {
    console.log(xhrReq.responseText);
    dataCOM = JSON.parse(xhrReq.responseText);
    if(!checkingCOM){
      for (let i = 0; i<dataCOM.portsNum.length; i++){
        select.options[select.options.length] = new Option(dataCOM.portsNum[i], dataCOM.portsNum[i]);
        data.COM = dataCOM.portsNum[0];
        checkingCOM = true;
      }
    };
  }

};

select.onchange = function() {
  data.COM = select.value;
};

speedInput.onchange = function() {
  data.Input = speedInput.value;
};

Turn1.onchange = function(){
  cockpitNum[0] = Turn1.value + 1;
};

Turn2.onchange = function(){
  cockpitNum[1] = Turn2.value + 1;
};

Head1.onchange = function(){
  cockpitNum[2] = Head1.value + 1; 
};

Art1.onchange = function(){
  cockpitNum[3] = Art1.value - 1; 
};

Art2.onchange = function(){
  cockpitNum[4] = Art2.value - 1;
};


var statusBarCheck = false;
function move(num) {
  var elem = document.getElementById("myBar" + num);   
  var width = 0;
  var id = setInterval(frame, 100);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      statusBarCheck = true;
      listCheck();

    } else {
      width++; 
      elem.style.width = width + '%'; 
      elem.innerHTML = width * 1  + '%';
    }
  }
};




function listCheck(){}
