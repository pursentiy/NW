

var finalArrAx = [];
var finalArrAy = [];
var finalArrAz = [];

var finalArrMx = [];
var finalArrMy = [];
var finalArrMz = [];

var finalArrGx = [];
var finalArrGy = [];
var finalArrGz = [];
//**********************************************************************************//
//SERVER SIDE
//**********************************************************************************//

//C:\Users\purse\Desktop\NWSDK\nw.exe C:\cockpitNW

$( document ).ready(function() {
 $('.preloader').css({"transform": "translateY(-100%)"});
});


$('.main-carousel').flickity({
  // options
  cellAlign: 'center',
  contain: false,
  wrapAround: true
});

$('.main-carousel-charts').flickity({
  // options
  cellAlign: 'center',
  contain: false,
  wrapAround: true
});

//CALIBRATION --- !!!! Исправить!

//определяет, стролить ли наклонные или нет. По дефолту строит
var tangentCheck = true;

var express = require('express');
var magnitron = {
	time: 0,
	array: [],
	sortArr: {x:[], y:[], z:[]}
};
var objCheck = false;
//var app = express();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

var path = require("path");
var fs = require('fs');
var bodyParser = require('body-parser');
var math = require('mathjs');
var lsq = require('least-squares');
math.config({
	number: 'number'
});
//объект для рассчета вариации Аллана с платы
var allan = {
  giro:{
    x: [],
    y: [],
    z: []
  },
  acs:{
    x: [],
    y: [],
    z: []
  },
  mag:{
    x: [],
    y: [],
    z: []
  },
  time: []
};
//объект для рассчета вариации Аллана с заранее подготовленного файла
var arrReady = {
  giro:{
    x: [],
    y: [],
    z: []
  },
  acs:{
    x: [],
    y: [],
    z: []
  },
  mag:{
    x: [],
    y: [],
    z: []
  },
  time: [],
  position: []
};
//Активные порты на данном устройств
var portsNum = [];
var SerialPortCheck = false;
var thermodata = [];
var settingsCOM;
var parsedSettings;
var arrayPos = [];
var arrayBuff = [];
var meanResuts = [[],[],[],[],[],[]];
var matrixReady;
var newArr = [[],[],[],[],[],[]];
var newArrCheck = [];
var checkIndex = 0;
//массив для проврки среднего значения 
var arrayMean = [[0],[0],[0]];
//значение, определяющее, есть ли повторение в данных
var checkPass = true;


var arr = 0;
var serialPort = require("browser-serialport");
var SerialPort = serialPort.SerialPort;
var angles = 0, timer, portOpen = false, COM, Input,serialport, i =0, check = 1;
var anglesArray = [[],[],[],[],[],[]], anglesArrayToCheck = [];


//расчет ВА через удаленный сервер
$("#submit").click(function (e) {

  let server404 = true;


  let test = 0;
  fs.readFile('json/allanVarianceClean.json', function(err, data) {
    if (err) throw err;
    test = JSON.parse(data);
  });

  setTimeout(function(){
    $.ajax({
      type: 'POST',
      data: JSON.stringify(test),
      contentType: 'application/json', 
      url: "http://80.211.165.213:3000/sendmessage",
      success : function(response){
      // console.log(response);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      let header = "Ошибка 404";
      let text1 = "Сервер временно недоступен. Расчет вариации Аллана возможен только на локальной машине.";


      textContainer(header, text1, true);
      $('.window .world').css({"display": "block"});
    }

  }).done(function() {
    gears();
    server404 = false;
  });

  let g = 0;
  function gears(){

    $('.serverGears').toggleClass('flowUp');

    var timerId = setInterval(function() {

      if(g+5<=95) {
        g += 5;
        $('.bar span').css({"width": g+"%"});
      }
      else  clearInterval(timerId);

    }, 25000);
  }




  let url = 'http://80.211.165.213:3000/serverResults.json';

  setTimeout(function() {

   // $('.serverGears').toggleClass('flowUp');

   fetch(url)
   .then(res => res.json())
   .then((out) => {
    console.log(out);
    if(out.finalAllanObj.finalArrAx.length != 0){
      g = 100;
      $('.bar span').css({"width": g+"%"});
      setTimeout(function() {
        $('.serverGears').toggleClass('flowUp');
      }, 3000);
      online(out);
      setTimeout(function() {
        tangentCheck = true;
        avarCoef();
        avarGystogramms();
        plotInserting();
      }, 4000);
    }
  })
   .catch(err => {  
   });
 }, 280000);
}, 500);




});


//чтение json файла с удаленного сервера
/*
var pos1 = document.getElementById("pos1"), pos2 = document.getElementById("pos2"), pos3 = document.getElementById("pos3");
pos1.onchange = function(){
  console.log(pos1.value);
  arrReady.position[pos1.value] = "acs"; 
};
pos2.onchange = function(){
  console.log(pos2.value);
  arrReady.position[pos2.value] = "mag"; 
};
pos3.onchange = function(){
  console.log(pos2.value);
  arrReady.position[pos3.value] = "giro";
};
*/
function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    // Display file content
    displayContents(contents);
  };
  reader.readAsText(file);
}

function displayContents(contents) {
  console.log(contents);
  //разбиваем весь текст по критерию
  let arrSplit = contents.split(';');




//параметр, который дробит каждый из датчиков на три положения: X, Y, Z
let countM = 0;
//параметр, определяющий, с какого именно датчика идет считывание данных
let det = 1;
let time = 1;
for(let i = 9; i < arrSplit.length-9; i++){
  countM++;
  if(det == 1)  pushElem(arrReady.position[det], countM, i);
  else if(det == 2)  pushElem(arrReady.position[det], countM, i);
  else  pushElem(arrReady.position[det], countM, i);
}

function pushElem(posit, index, num){
  let pos = posit;
  let count = index;
  let i = num;
  if(pos == "acs"){
    if(count == 1) arrReady.acs.x.push(arrSplit[i]);
    else if(count == 2) arrReady.acs.y.push(arrSplit[i]);
    else {
      arrReady.acs.z.push(arrSplit[i]);
      countM = 0;
      det++;
    }
  }
  else if(pos == "mag"){
    if(count == 1) arrReady.mag.x.push(arrSplit[i]);
    else if(count == 2) arrReady.mag.y.push(arrSplit[i]);
    else{
      arrReady.mag.z.push(arrSplit[i]);
      countM = 0;
      det++;
    }
  }
  else{
    if(count == 1) arrReady.giro.x.push(arrSplit[i]);
    else if(count == 2) arrReady.giro.y.push(arrSplit[i]);
    else{
      arrReady.giro.z.push(arrSplit[i]);
      countM = 0;
      det = 1;
      arrReady.time.push(time);
      time++;
    }
  }
}

var element = document.getElementById('file-content');
element.innerHTML = contents;

}
$('#allanStart').on('click',function(){ 
  allanVar();
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

//проверка аппроксимации(плагин)
function test(){
  var points = 0;
  fs.readFile('json/avar.json', function(err, data) {
    if (err)
      throw err;
    points = JSON.parse(data);
    console.log(points);
  });
  
  setTimeout(function() {
   var testArrX = [];
   var testArrY = [];
   var newPoints = simplify(points.points, 0.00008)
   for(let i = 0; i < newPoints.length; i++){
    testArrX.push(newPoints[i].x);
    testArrY.push(newPoints[i].y);
    console.log(i);
  }
  var traceAX = {
    y:  testArrY,
    x:  testArrX,
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'rgb(215, 47, 0)'
    },
    name: 'OX'
  };

  var layout = {
    xaxis: {
      type: 'log',
      autorange: true
    }, 
    yaxis: {
      type: 'log', 
      autorange: true
    }
  };

  var dataAX = [traceAX];


  Plotly.newPlot('avarRow', dataAX, layout);

},2000);





}
//test();

//массив в который буду записываться все данные ВА


$('#allanPlot').on('click',function(){ 
  $('.window #button_window').css({"display": "none"});
  $('.window .wrapAllan').css({"display": "block"});
  $('.window .clock').css({"display": "block"});
  let header = "Предупреждение";
  let text1 = "Так как расчет будет проводиться на локальном компьютере, возможны зависания системы от ~2 до ~5 минут в зависимости от мощности устройства. Не выключать и не перезагружать приложение.";


  textContainer(header, text1, true);
});

$('#button_windowAC').on('click',function(){ 

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
    $('.window #button_window').css({"display": "block"});
    $('.window .wrapAllan').css({"display": "none"});
    $('.window .clock').css({"display": "none"});
  }, 300);

});

$('#button_windowAS').on('click',function(){ 

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
    $('.window #button_window').css({"display": "block"});
    $('.window .wrapAllan').css({"display": "none"});
    $('.window .clock').css({"display": "none"});
  }, 300);

//считывание данных из файла
fs.readFile('json/allanVarianceClean.json', function(err, data) {
  if (err)
    throw err;
  arr = JSON.parse(data);
});




// полный расчет ВА
setTimeout(function() {
  mapApproximation();
  mapRouting();
  coefCount();
  avarCoef();
  avarGystogramms();
  plotInserting();
},4000);


$('#logInfo_text').text("Рассчет коэффициентов и построение графиков");
$('.posCheck').addClass('flowUp');
setTimeout(function() { 
  //plotRoutong();
  $('.circle-loader-check').toggleClass('load-complete-check');
  $('.checkmark-check').toggle();
  setTimeout(function() { 
   $('.posCheck').removeClass('flowUp');
   setTimeout(function() { 
    $('.block6').css('display','block');
    $('.block7').css('display','block');
    $('.block8').css('display','block');
    $('#logInfo_text').text("Идет проверка положения...");
    $('.circle-loader-check').toggleClass('load-complete-check');
    $('.checkmark-check').toggle();
  },2000);
 },3000);
},3000);

});;






//получение и запись всех доступных портов на компьютере 
serialPort.list(function (err, ports) {
	ports.forEach(function(port) {
		portsNum.push(port.comName)
	});
	console.log(portsNum);
});


//открытие порта для передачи данных
function SerialPortStart(COM, Input){
	serialPort = new SerialPort(COM, {
		baudrate: +Input || 9600
	});
	serialPort.on('data', function (data) { 
		angles = data.toString(); 
		console.log(angles);
	});
	portOpen = true;

	setTimeout(function() {
		serialPort.close(function (err) {
			console.log('port closed', err);
		});
		portOpen = false;
	},1000);
};


//закрытие порта
function portClosing(){
  serialPort.close(function(err) {
    console.log('port closed', err);
    $('#button_window').css('display', 'none');
    $('#button_restart').css('display', 'block');
    let head = "Ошибка соединения с платой"
    let text = "Отключите плату от компьютера, после этого опять подключите, затем нажмите на кнопку Перезагрузить"
    textContainer(head, text, true);
  });
  portOpen = false;
}



//plot3DRouting();


//сбор логов с платы, их сохранение и закрытие порта
function dataSaving(){
	serialPort = new SerialPort(COM, {
		baudrate: +Input || 9600
	});

	serialPort.on('data', function (data) { 
		angles = data.toString(); 
		console.log(angles);
		anglesArray[checkIndex][i] =  data.toString();
		i++; 
	});

	portOpen = true;
	setTimeout(function() {

		serialPort.close(function (err) {
			console.log('цикл завершен' + check);
		});

		parser(checkIndex, anglesArray[checkIndex],false);
		meanValue(checkIndex);
		checkIndex++;
		i = 0;
		portOpen = false;

		if(checkIndex == 5){
			chesck();
		};

	}, 1000);

}

//проверка на положение перед началом сбора логов
function dataSavingCheck(){
	serialPort = new SerialPort(COM, {
		baudrate: +Input || 9600
	});

	serialPort.on('data', function (data) { 
		console.log(data.toString());
		anglesArrayToCheck.push(data.toString());
	});

	portOpen = true;
	setTimeout(function() {
		serialPort.close(function (err) {
			console.log('Цикл проверки завершен');
			console.log(err);
		});
		parser(0, anglesArrayToCheck, true);
		portOpen = false;
	}, 2000);

}

function magnitronDataSaving(){
	serialPort = new SerialPort(COM, {
		baudrate: +Input || 9600
	});

	serialPort.on('data', function (data) { 
		console.log(data.toString());
		anglesArrayToCheck.push(data.toString());
	});

	portOpen = true;
	setTimeout(function() {
		serialPort.close(function (err) {
			console.log('Цикл проверки завершен');
			console.log(err);
		});
		parser(0, anglesArrayToCheck, false);
		portOpen = false;
		meanValue(0 , magnitron.array);
	}, +magnitron.time || 5000);

}

//парсинг данных с платы
function parser(num,a,check){
  //идет предварительный сбор логов для определения, нет ли повторений
  if(calibrationCheck[1]) {
  	let arrOld = a;
  	let index = num;
  	let j = -1;
  	let parseCheck = false;
  	let rest;
  	arrOld.shift();
  	for(let i = 0; i < arrOld.length; i++){
  		if( arrOld[i].indexOf("\r") != -1 ){
  			if(parseCheck){
  				magnitron.array[j] += arrOld[i].substring(0, arrOld[i].indexOf("\r"))
  			}
  			j++;
  			parseCheck = true;
  			let position = arrOld[i].indexOf("\r");
  			if((position + 1) != (arrOld[i].length - 1)) magnitron.array[j] = arrOld[i].substring(position+1);
  		}
  		else if(parseCheck){
  			magnitron.array[j] += arrOld[i];
  		}
  	}
  	magnitron.array.pop();
  }
  else if(check && checkIndex > 0){
  	let arrOld = a;
    //let index = num;
    let j = -1;
    let parseCheck = false;
    let rest;
    arrOld.shift();
    for(let i = 0; i < arrOld.length; i++){
    	if( arrOld[i].indexOf("\r") != -1 ){
    		if(parseCheck){
    			newArrCheck[j] += arrOld[i].substring(0, arrOld[i].indexOf("\r"))
    		}
    		j++;
    		parseCheck = true;
    		let position = arrOld[i].indexOf("\r");
        //console.log(position);
        if((position + 1) != (arrOld[i].length - 1)) newArrCheck[j] = arrOld[i].substring(position+1);
      }
      else if(parseCheck){
       newArrCheck[j] += arrOld[i];
     }
   }
   newArrCheck.pop();
   for(let i = 0; i < newArrCheck.length; i++){

     if(newArrCheck[i].indexOf("d") != -1){
      newArrCheck[i] = newArrCheck[i].substr(newArrCheck[i].indexOf("d", 3)+1);
    }
    else {
      newArrCheck[i] = newArrCheck[i].substr(1);
    }
  }
  let buf = 0;
  let arraySlice = [];
  if(click >= 2) {
   newArrCheck.reverse();
   newArrCheck = newArrCheck.slice(0, 2);
 }
 for(let i = 0; i < newArrCheck.length; i++){
   arraySlice = newArrCheck[i].split(';');
   if(calibrationCheck[0]){
    arraySlice = arraySlice.slice(0, 3);
  }
  for(let j = 0; j < arraySlice.length; j++){
    arrayMean[j][i] = +arraySlice[j];
  }
}
for(let i = 0; i < arrayMean.length; i++){
	if((math.mean(arrayMean[i])).toFixed(3) >= 0.8 && (math.mean(arrayMean[i])).toFixed(3) <= 1.3 || (math.mean(arrayMean[i])).toFixed(3) <= -0.8 && (math.mean(arrayMean[i])).toFixed(3) >= -1.2){
		arrayMean[0] = (math.mean(arrayMean[i])).toFixed(3);
		arrayMean[1] = i;
	}
}
}
//обычный сбор логов
else if(check){ //убрать чек
	let arrOld = a;
	let index = num;
	let j = -1;
	let parseCheck = false;
	let rest;
	arrOld.shift();
	for(let i = 0; i < arrOld.length; i++){
		if( arrOld[i].indexOf("\r") != -1 ){
			if(parseCheck){
				newArr[index][j] += arrOld[i].substring(0, arrOld[i].indexOf("\r"))
			}
			j++;
			parseCheck = true;
			let position = arrOld[i].indexOf("\r");
			if((position + 1) != (arrOld[i].length - 1)) newArr[index][j] = arrOld[i].substring(position+1);
		}
		else if(parseCheck){
			newArr[index][j] += arrOld[i];
		}
	}
	newArr[index].pop();
	for(let i = 0; i < newArr[index].length; i++){

		if(newArr[index][i].indexOf("d") != -1){
			newArr[index][i] = newArr[index][i].substr(newArr[index][i].indexOf("d", 3)+1);
		}
		else {
			newArr[index][i] = newArr[index][i].substr(1);
		}
	}
}
else{
  let arrOld = a;
    //let index = num;
    let j = -1;
    let parseCheck = false;
    let rest;
    arrOld.shift();
    for(let i = 0; i < arrOld.length; i++){
      if( arrOld[i].indexOf("\r") != -1 ){
        if(parseCheck){
          newArrCheck[j] += arrOld[i].substring(0, arrOld[i].indexOf("\r"))
        }
        j++;
        parseCheck = true;
        let position = arrOld[i].indexOf("\r");
        //console.log(position);
        if((position + 1) != (arrOld[i].length - 1)) newArrCheck[j] = arrOld[i].substring(position+1);
      }
      else if(parseCheck){
       newArrCheck[j] += arrOld[i];
     }
   }
   newArrCheck.pop();
   for(let i = 0; i < newArrCheck.length; i++){
     if(newArrCheck[i].indexOf("d") != -1){
      newArrCheck[i] = newArrCheck[i].substr(newArrCheck[i].indexOf("d", 3)+1);
    }
    else {
      newArrCheck[i] = newArrCheck[i].substr(1);
    }
  }
  let buf = 0;


  for(let i = 0; i < newArrCheck.length; i++){
   arraySlice = newArrCheck[i].split(';');
   allan.giro.x.push(arraySlice[6]);
   allan.giro.y.push(arraySlice[7]);
   allan.giro.z.push(arraySlice[8]);
   allan.acs.x.push(arraySlice[0]);
   allan.acs.y.push(arraySlice[1]);
   allan.acs.z.push(arraySlice[2]);
   allan.mag.x.push(arraySlice[3]);
   allan.mag.y.push(arraySlice[4]);
   allan.mag.z.push(arraySlice[5]);
   allan.time.push(i);
   arraySlice.splice(0, arraySlice.length);
 }
 fs.writeFileSync('json/allan1.json',JSON.stringify({allan}, null, 4));


}
};







//прием запросов с сервера: с пометкой "check" (значит, нужен будет сбор данных) и все остальные запросы для которых идет обычная обработка 
function requestRecieve(arg){
  //app.post('/', function(req, res){
  	var obj = {};
  	if(arg.test == 'check'){
  		check = arg.number;
  		if(portOpen)     portClosing();

  		setTimeout(function() { 
        //первый сбор данных
        if(checkIndex < 1)  {
        	dataSaving();
        	bar();
        }
        //последующие итерации
        else{
        	$('.posCheck').addClass('flowUp');
          //проверка на положение
          dataSavingCheck();
          setTimeout(function() { 
          	checkMatching();
          },5000);
          
          setTimeout(function() {
            //если данные из положения уникальные
            if(checkPass){
            	$('.circle-loader-check').toggleClass('load-complete-check');
            	$('.checkmark-check').toggle();
            	setTimeout(function() { 
            		$('.posCheck').removeClass('flowUp');
            		setTimeout(function() { 
            			$('.circle-loader-check').toggleClass('load-complete-check');
            			$('.checkmark-check').toggle();
            		},2000);
            	},2000);
            	dataSaving();
            	bar();
            	checkPass = true;
            }
           //есть повторение
           else {
           	checkPass = true;
           	document.getElementById("logInfo_text").textContent = "Что-то пошло не так...";
           	$(".circle-loader-check").css("border-left-color", "#ff2828");
           	$('#button_window').on('click',function(){
           		setTimeout(function() { 
           			$('.posCheck').removeClass('flowUp');
           		},1000);
           		setTimeout(function() { 
           			$(".circle-loader-check").css("border-left-color", "#f5962e");
           			document.getElementById("logInfo_text").textContent = "Идет проверка положения...";
           		},2000);
           	});
           } 
         }, 6000);
        }
      }, 1000);
    //clearTimeout(timer);
  }
  else if(arg){
   console.log(arg);
   COM = arg.COM;
   Input = arg.Input;
   console.log( portOpen);
   if(portOpen) {
    console.log("Port was closed")
    portClosing();
  }  
  console.log('serialport has started');
  setTimeout(function() { SerialPortStart(arg.COM, arg.Input); }, 1000);
}
  //res.send(req.body);
//});
};



//заполнение статус бара и другие модальные окна
function bar(){
	move(checkIndex + 1);
	click++;
	scanTest.number = click;
	timer = setTimeout(function() {
        //Если сканирование всех положений датчика завершено
        if(checkIndex == 6){
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
        					scrollTop: $(".block3").offset().top - 50
        				}, 2000);
        			});
        		},1000);
        	}, 1000);

        	let header = "Поздравляю!"
        	let text = "Калибровка датчика полностью закончена!"

        	textContainer(header, text, 0,  true);

        } 
        //Калибровка еще не закончена
        else {

        	let header = "Что делать дальше?";
        	let text1 = "Положите датчик в положение ";
        	let text2 = " и нажмите на кнопку 'Начать сбор данных'"

        	textContainer(header, text1, text2, false);
          //document.getElementById('click_me').click();

        }
      }, 11000);
}

/*
app.get('/', function(req, res){ 
  res.sendFile(__dirname + '/index.html'); 
}); 

//передача данных с сервера на сторону клиента
io.on('connection', function(socket){ 
  timer = setInterval(function() {
    io.emit('input', angles) 
  }, 100);

}); 

http.listen(3000, function(){ 
  console.log('server has started') 
});
*/


//********************************************************************************************************************//
//CLIENT SIDE
//********************************************************************************************************************//


$('#button_window_menu').on('click',function(){ 
	$('.wrapper').toggleClass('open_settings');
});

$('.settings_menu').on('click',function(){ 
	$('.wrapper').toggleClass('open_settings');
});

$('#magnitronStart').click(function(){
	calibrationCheck[1] = true;
	magnitronDataSaving();
});


$('.main_navigation ').css(
	'transition','none');

setTimeout(function() {
	$('.main_navigation ').css(
		'transition','transform 0.6s ease');
},1000);

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
var head_window =  document.getElementById('head_window');

scanTest.test = 'check'
scanTest.number = 1;



$(function(){

	$(window).scroll(function () {
    if($( ".wrapper" ).hasClass( "open_menu" )){
      $('.question').css("display:none");
      $('.question').fadeOut(300);
    }
    else{
      if ($(this).scrollTop() > 200) {
        $('.question').css("display:block");
        $('.question').fadeIn(1000);
      }
      else{
        $('.question').css("display:none");
        $('.question').fadeOut(300);
      }
    }

  });

//Нажатие на значок вопросж
quest.onclick = function(){
	head_window.innerHTML = "И как же тут все работает?"
	text.innerHTML = "На данной странице можно расчитать вариацию Аллана";
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

//Открытие и закрытие меню
$('.button_toggle').on('click',function(){
    //$('.main_navigation').toggleClass('open');
    $('.wrapper').toggleClass('open_menu');
  });





});


//Закрытие всплавающего окна с подсказками
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
    $('.window .world').css('display','none');
  }, 300);
});

$(function(){



	$('#clickcalibration').click(function(){
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
setTimeout(function () {
	$(function(){
		$('html, body').animate({
			scrollTop: $(".block1").offset().top - 50
		}, 2000);
	});
},1000);



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
//document.getElementById('click_me').click();

setTimeout(function () {
	scroll();
},1000);



});

	$('#open_button').on('click',function(){ 
		$('.wrapper').toggleClass('open_settings');
	});

  $('#allanStart').on('click', function(){
    dataSaving();
  })

  $('.proMode').on('click',function(){ 
    if($(this).is(":checked")) { $('.additionalSett').toggleClass('onDisplay') }
     else {$('.additionalSett').toggleClass('onDisplay')}
   });


});



//Запись COM портов с компьютера в выпадающий список
function COMinput() {
	dataCOM = portsNum;
	if(!checkingCOM){
		for (let i = 0; i<dataCOM.length; i++){
			select.options[select.options.length] = new Option(dataCOM[i], dataCOM[i]);
			data.COM = dataCOM[0];
			checkingCOM = true;
		}
	};
}
setTimeout(function () {
	COMinput();
},1000);

//Сохранение введеных пользователем настроек выпадающего списка
select.onchange = function() {
	data.COM = select.value;
};

speedInput.onchange = function() {
	data.Input = speedInput.value;
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
			elem.innerHTML = width * 1  + '%';
		}
	}
};


//clock

const secondHand = document.querySelector('.second-hand');
const minsHand = document.querySelector('.min-hand');
const hourHand = document.querySelector('.hour-hand');

function setDate() {
  const now = new Date();

  const seconds = now.getSeconds();
  const secondsDegrees = ((seconds / 60) * 360) + 90;
  secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

  const mins = now.getMinutes();
  const minsDegrees = ((mins / 60) * 360) + ((seconds/60)*6) + 90;
  minsHand.style.transform = `rotate(${minsDegrees}deg)`;

  const hour = now.getHours();
  const hourDegrees = ((hour / 12) * 360) + ((mins/60)*30) + 90;
  hourHand.style.transform = `rotate(${hourDegrees}deg)`;
}

setInterval(setDate, 1000);

setDate();

function listCheck(){}
