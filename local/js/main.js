var path = require("path");
var fs = require('fs');
var bodyParser = require('body-parser');
var math = require('mathjs');
var lsq = require('least-squares');
math.config({
  number: 'number'
});

$(document).ready(function() {
  $('.preloader').css({
    "transform": "translateY(-100%)"
  });
});

//Активные порты на данном устройств
var portsNum = [];
var SerialPortCheck = false;
var thermodata = [];
var settingsCOM;
var parsedSettings;
var arrayPos = [];
var arrayBuff = [];
var meanResuts = [[], [], [], [], [], []];
var matrixReady;

cockpitNum = [];

//массив для проврки среднего значения 
var arrayMean = [[0], [0], [0]];
//значение, определяющее, есть ли повторение в данных
var checkPass = true;

var serialPort = require("browser-serialport");
var SerialPort = serialPort.SerialPort;
var angles = 0, timer, portOpen = false, COM, Input, serialport, i = 0, check = 1;
var anglesArray = [[], [], [], [], [], []]
, anglesArrayToCheck = [];

var elem = [[], [], []];
var flowCheck = false;
//получение и запись всех доступных портов на компьютере 
serialPort.list(function(err, ports) {
  ports.forEach(function(port) {
    portsNum.push(port.comName)
  });
  console.log(portsNum);
});

var test = 0;
var arrrr = 0;
//открытие порта для передачи данных
function SerialPortStart(COM, Input) {
  let line = false;
  let dotesCheck = 0;
  let part = 0;
  let i = 0;
  let row = false;
  let dote = 0;

  let checkPeriod = 0;
  let firstTimeCOM = true;
  let timerCheck = 0;
  let testDown = true;
  if(firstTimeCOM){
    serialPort = new SerialPort(COM,{
      baudrate: +Input || 9600
    });
    firstTimeCOM  = false;
  }
  serialPort.on('data', function(data) {
    flowCheck = true;
    if(flowCheck && testDown){
      flowCheckDown()

    }
    angles = data.toString();
    if (checkPeriod >= 555) {
      if (angles.indexOf("\r") != -1) {
                    // console.log("mimo");
                    line = true;
                    i++;
                    if (i >= 2) {
                      if (elem[1][i - 1].length >= 70 && elem[1][i - 1].length <= 86)
                        console.log(elem[1][i - 1]);
                      dote = elem[1][i - 1].split(';');
                      if (dote[0].indexOf("-") + 1 == dote[0].indexOf(".") - 1)
                        dote[0] = dote[0].slice(dote[0].indexOf(".") - 2, dote[0].length);
                      else
                        dote[0] = dote[0].slice(dote[0].indexOf(".") - 2, dote[0].length);

 //Третий
 if(cockpitNum[4] != null) {
   $('header .mainBlock1 .cockpit .elements .blockHaw .background').css({
    top: ((-1) * (+dote[cockpitNum[4]] * 20)) + 'px'
  });
 }
 else{
   $('header .mainBlock1 .cockpit .elements .blockHaw .background').css({
    top: ((-1) * (+dote[1] * 20)) + 'px'
  });
 }

 if(cockpitNum[3] != null) {
   $('header .mainBlock1 .cockpit .elements .blockHaw .cirle').css({
    transform: 'rotate(' + ( (+dote[cockpitNum[3]])/5) + 'deg)'
  });

 }
 else{
   $('header .mainBlock1 .cockpit .elements .blockHaw .cirle').css({
    transform: 'rotate(' + ( (+dote[7])/5) + 'deg)'
  });
 }

    //Второй

    if(cockpitNum[2] != null) {
     $('header .mainBlock1 .cockpit .elements .blockRoll .background').css({
      transform: 'rotate(' + ((-1) * (+dote[cockpitNum[2]])/5) + 'deg)'
    });

   }
   else{
     $('header .mainBlock1 .cockpit .elements .blockRoll .background').css({
      transform: 'rotate(' + ((-1) * (+dote[8])/5) + 'deg)'
    });
   }

     //Первый датчик

     if(cockpitNum[0] != null) {
      if(+dote[cockpitNum[0]] > -15 && +dote[cockpitNum[0]] < 15){
        $('header .mainBlock1 .cockpit .elements .blockPitch .circle').css({
         left: ((1) * (+dote[cockpitNum[0]] + 79.5)) + 'px'
       });
      }
    }
    else{
      if(+dote[8] > -15 && +dote[8] < 15){
        $('header .mainBlock1 .cockpit .elements .blockPitch .circle').css({
         left: ((1) * (+dote[8] + 79.5)) + 'px'
       });
      }
    }

    if(cockpitNum[1] != null) {
      $('header .mainBlock1 .cockpit .elements .blockPitch .arrow').css({
        transform: 'rotate(' + ((-1) * (+dote[cockpitNum[1]])/5) + 'deg)'
      }); 
    }
    else{
      $('header .mainBlock1 .cockpit .elements .blockPitch .arrow').css({
        transform: 'rotate(' + ((-1) * (+dote[7])/5) + 'deg)'
      }); 
    }



  }
}
elem[1][i] += angles;

test += angles;
}
checkPeriod++;
});

  function flowCheckDown(){
    if(flowCheck){
      testDown = false;
            //если данные из положения уникальные
            $('.circle-loader-check').toggleClass('load-complete-check');
            $('.checkmark-check').toggle();
            setTimeout(function() {
              $('.posCheck').removeClass('flowUp');
              setTimeout(function() {
                $('.circle-loader-check').toggleClass('load-complete-check');
                $('.checkmark-check').toggle();
              }, 2000);

            }, 2000);
          }
        }




        portOpen = true;
      }
      ;
//закрытие порта
function portClosing() {
  if(serialPort.connectionId === -2){
    let header = "Поздравляю!"
    let text = "Калибровка датчика полностью закончена!"
    textContainer(head, text1, check);
  }
 // if (!jQuery.isEmptyObject(serialPort.options)) {
  else{
    serialPort.close(function(err) {
      console.log('port closed', err);
      $('#button_window').css('display', 'none');
      $('#button_restart').css('display', 'block');
      $('.sea').css('display', 'block');
      let head = "Упс... Что-то пошло не так..."
      let text = "Переподключите плату к компьютеру, затем нажмите на кнопку Перезагрузить"
      textContainer(head, text, true);
    });
    portOpen = false;
  }
}


$('#button_restart').on('click', function() {

  chrome.runtime.reload();
});




function textContainer(head, text1, check){
  if(check){
    head_window.innerHTML = head;
    text.innerHTML = text1;
  }
  else{
    head_window.innerHTML = head;
    text.innerHTML = text1 + click + text2;
  }
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
}

quest.onclick = function(){
  head_window.innerHTML = "И как же тут все работает?"
  text.innerHTML = "На данной странице можно посмотреть на передачу данных с платы в графическом виде, на приборной панели. Для начала необходимо нажать на кнопку 'Настройки', где можно будет выбрать необходимые параметры для подключения";
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


    $(window).scroll(function () {
    if($( ".wrapper" ).hasClass( "open_menu" )){
      $('.question').css("display:none");
      $('.question').fadeOut(300);
    }
    else{
      if ($(this).scrollTop() > 50) {
        $('.question').css("display:block");
        $('.question').fadeIn(1000);
      }
      else{
        $('.question').css("display:none");
        $('.question').fadeOut(300);
      }
    }

  });



//прием запросов с сервера: с пометкой "check" (значит, нужен будет сбор данных) и все остальные запросы для которых идет обычная обработка 
function requestRecieve(arg) {
    //app.post('/', function(req, res){
      var obj = {};
      if (arg.test == 'check') {
        check = arg.number;
        if (portOpen)
          portClosing();

        setTimeout(function() {
            //первый сбор данных
            if (checkIndex < 1) {
              dataSaving();
              bar();
            }//последующие итерации
            else {
              $('.posCheck').addClass('flowUp');
                //проверка на положение
                dataSavingCheck();
                setTimeout(function() {
                  checkMatching();
                }, 5000);

                setTimeout(function() {
                    //если данные из положения уникальные
                    if (checkPass) {
                      $('.circle-loader-check').toggleClass('load-complete-check');
                      $('.checkmark-check').toggle();
                      setTimeout(function() {
                        $('.posCheck').removeClass('flowUp');
                        setTimeout(function() {
                          $('.circle-loader-check').toggleClass('load-complete-check');
                          $('.checkmark-check').toggle();
                        }, 2000);
                      }, 2000);
                      dataSaving();
                      bar();
                      checkPass = true;
                    }//есть повторение
                    else {
                      checkPass = true;
                      document.getElementById("logInfo_text").textContent = "Что-то пошло не так...";
                      $(".circle-loader-check").css("border-left-color", "#ff2828");
                      $('#button_window').on('click', function() {
                        setTimeout(function() {
                          $('.posCheck').removeClass('flowUp');
                        }, 1000);
                        setTimeout(function() {
                          $(".circle-loader-check").css("border-left-color", "#f5962e");
                          document.getElementById("logInfo_text").textContent = "Идет проверка положения...";
                        }, 2000);
                      });
                    }
                  }, 6000);
              }
            }, 1000);
        //clearTimeout(timer);
      } else if (arg) {
        console.log(arg);
        COM = arg.COM;
        Input = arg.Input;
        console.log(portOpen);
        if (portOpen) {
          console.log("Port was closed")
          portClosing();
        }
        console.log('serialport has started');
        setTimeout(function() {
          SerialPortStart(arg.COM, arg.Input);
        }, 1000);
      }
    //res.send(req.body);
    //});
  }
  ;
  $('#button_window_menu').on('click', function() {
    $('.wrapper').toggleClass('open_settings');
  });

  $('.settings_menu').on('click', function() {
    $('.wrapper').toggleClass('open_settings');
  });

  $('#magnitronStart').click(function() {
    calibrationCheck[1] = true;
    magnitronDataSaving();
  });

  $('.main_navigation ').css('transition', 'none');

  setTimeout(function() {
    $('.main_navigation ').css('transition', 'transform 0.6s ease');
  }, 1000);

  var obj = {};
//Активные COM-порты на компьютере
var dataCOM;
var select = document.getElementById("example-select");
var checkingCOM = false;
// Параметры установленных для датчика параметров: COM-порт и скорость
var data = {};
var speedInput = document.getElementById("speed-input");
//Параметры для определение колчичества пройденных калибровок
var scanTest = {};
var calibrationCheck = [false, false, false];
var click = 1;
var matrix;
//var socket = io(); 
var scan = document.getElementById("scan");
var timer;
var text = document.getElementById('text');
var head_window = document.getElementById('head_window');

scanTest.test = 'check'
scanTest.number = 1;

/*
setTimeout(function() {
  $('.window').css('display', 'block');
  setTimeout(function() {
    $('.window').css('opacity', '1');
  }, 100);

  $('.overlay ').css('display', 'block');
  setTimeout(function() {
    $('.overlay ').css('opacity', '0.7');
  }, 100);
}, 2000);
*/

$(function() {



    //Открытие и закрытие меню
    $('.button_toggle').on('click', function() {
        //$('.main_navigation').toggleClass('open');
        $('.wrapper').toggleClass('open_menu');
      });

  });

//Закрытие всплавающего окна с подсказками
$('#button_window').on('click', function() {
  setTimeout(function() {
    $('.window').css('display', 'none');
  }, 200);
  $('.window').css('opacity', '0');
  $('.overlay ').css('display', 'none');
  setTimeout(function() {
    $('.overlay ').css('opacity', '0');
  }, 300);
});

$(function() {

  $('#button_over').click(function() {
    portClosing();
    document.getElementById("logInfo_text").textContent = "Отключение платы";
    $('.posCheck').addClass('flowUp');

    setTimeout(function() {
            //если данные из положения уникальные
            $('.circle-loader-check').toggleClass('load-complete-check');
            $('.checkmark-check').toggle();
            setTimeout(function() {
              $('.posCheck').removeClass('flowUp');
              setTimeout(function() {
                $('.circle-loader-check').toggleClass('load-complete-check');
                $('.checkmark-check').toggle();
                document.getElementById("logInfo_text").textContent = "Подключение к плате";
              }, 2000);
            }, 2000);
          }, 2000);
  });

  $('#click').click(function() {
    $('.wrapper').toggleClass('open_settings');
    $('.posCheck').addClass('flowUp');

    setTimeout(function(){
      if(elem[1].length == 0) {
        $('#button_window').css('display', 'none');
        $('#button_restart').css('display', 'block');
        $('.sea').css('display', 'block');
        let head = "Упс... Что-то пошло не так..."
        let text = "Переподключите плату к компьютеру, затем нажмите на кнопку Перезагрузить"
        textContainer(head, text, true);
      }
    },10000);


        //Отправка данных о введенных параметрах COM-порта на сервер
        /*  $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json', 
      url: "http://localhost:3000",
      success: function(data) {
        console.log('sucsess');
        //console.log(data);
      }
    }); */
    requestRecieve(data);

        //Открытие всплывающего окна с подсказками
/*
        head_window.innerHTML = "Что делать дальше?"
        text.innerHTML = "Положите датчик в положение " + click + " и нажмите на кнопку 'Начать сбор данных'";
        $('.window').css('display', 'block');
        setTimeout(function() {
          $('.window').css('opacity', '1');
        }, 100);

        $('.overlay ').css('display', 'block');
        setTimeout(function() {
          $('.overlay ').css('opacity', '0.7');
        }, 100);
        //document.getElementById('click_me').click();

        setTimeout(function() {
          scroll();
        }, 1000);
        */
      });


  $('#open_button').on('click', function() {
    $('.wrapper').toggleClass('open_settings');
  });

  $('#allanStart').on('click', function() {
    dataSaving();
  })

  $('.proMode').on('click', function() {
    if ($(this).is(":checked")) {
      $('.additionalSett').toggleClass('onDisplay')
    } else {
      $('.additionalSett').toggleClass('onDisplay')
    }
  });

});




//Распределение матрицы Kx по столбцам на сайте
function coeffMatrixSet() {
  let row = document.getElementsByClassName('row');
  let rowElements = document.getElementsByClassName('element');
  let coefficientMatrix = document.getElementsByClassName('coeff');

    //matrix = JSON.parse(xhrReqMatrix.responseText);
    let y = 0;
    for (let i = 0; i < matrixReady.length; i++) {
      if (i == 9) {
        coefficientMatrix[y].innerHTML = '(' + +matrixReady[i] + '';
        y++;
      } else if (i == 10) {
        coefficientMatrix[y].innerHTML = '' + +matrixReady[i] + '';
        y++;
      } else if (i == 11) {
        coefficientMatrix[y].innerHTML = '' + +matrixReady[i] + ')';
        y++;
      } else
      rowElements[i].innerHTML = '' + +matrixReady[i] + '';
    }
    $(".bracketL").css("height", $('#matrix').height());
    $(".bracketR").css("height", $('#matrix').height());
    //console.log(xhrReqMatrix.responseText); 
  }

//Запись COM портов с компьютера в выпадающий список
function COMinput() {
  dataCOM = portsNum;
  if (!checkingCOM) {
    for (let i = 0; i < dataCOM.length; i++) {
      select.options[select.options.length] = new Option(dataCOM[i],dataCOM[i]);
      data.COM = dataCOM[0];
      checkingCOM = true;
    }
  }
  ;
}
setTimeout(function() {
  COMinput();
}, 1000);

//Сохранение введеных пользователем настроек выпадающего списка
select.onchange = function() {
  data.COM = select.value;
}
;

speedInput.onchange = function() {
  data.Input = speedInput.value;
}
;
//значения для режима разработчика
Turn1.onchange = function(){
  cockpitNum[0] = +Turn1.value - 1;
};

Turn2.onchange = function(){
  cockpitNum[1] = +Turn2.value - 1;
};

Head1.onchange = function(){
  cockpitNum[2] = +Head1.value - 1; 
};

Art1.onchange = function(){
  cockpitNum[3] = +Art1.value - 1; 
};

Art2.onchange = function(){
  cockpitNum[4] = +Art2.value - 1;
};


//Заполнение статус бара
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
      elem.innerHTML = width * 1 + '%';
    }
  }
}
;