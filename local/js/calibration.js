

//**********************************************************************************//
//SERVER SIDE
//**********************************************************************************//

//C:\Users\purse\Desktop\NWSDK\nw.exe C:\cockpitNW


//CALIBRATION --- !!!! Исправить!
$('.main-carousel').flickity({
  // options
  cellAlign: 'center',
  contain: false,
  wrapAround: true
});

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
var matrix = [],
Y =
[
[1,0,0,-1,0,0,0,-1,0,0,1,0,0,0,1,0,0,-1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
],
Ymin =  [
[1,0,0,-1,0,0,0,-1,0,0,1,0,0,0,1,0,0,-1]],
devidedMatrix = [], matrix3x3 = [[],[],[]], vector = [];
var newArr = [[],[],[],[],[],[]];
var newArrCheck = [];
var checkIndex = 0;
//массив для проврки среднего значения 
var arrayMean = [[0],[0],[0]];
//значение, определяющее, есть ли повторение в данных
var checkPass = true;

$( document ).ready(function() {
 $('.preloader').css({"transform": "translateY(-100%)"});
});


var serialPort = require("browser-serialport");
var SerialPort = serialPort.SerialPort;
var angles = 0, timer, portOpen = false, COM, Input,serialport, i =0, check = 1;
var anglesArray = [[],[],[],[],[],[]], anglesArrayToCheck = [];


//чтение json файла с удаленного сервера


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




$('#magnitronPlot').on('click',function(){ 
  //alert('text');
  $('#logInfo_text').text("Идет расчет коэффициентов");
  $('.posCheck').addClass('flowUp');
  setTimeout(function() { 
   magnetometrCalibration();
   $('.circle-loader-check').toggleClass('load-complete-check');
   $('.checkmark-check').toggle();
   setTimeout(function() { 
     $('.posCheck').removeClass('flowUp');
     setTimeout(function() { 
      $('#logInfo_text').text("Идет проверка положения...");
      $('.circle-loader-check').toggleClass('load-complete-check');
      $('.checkmark-check').toggle();
    },2000);
   },3000);
 },3000);

});


   //plotRouting();



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
      if (!(err === undefined)) {
        $('#button_window').css('display', 'none');
        $('#button_restart').css('display', 'block');
        $('.sea').css('display', 'block');
        let head = "Упс... Что-то пошло не так..."
        let text = "Переподключите плату к компьютеру, затем нажмите на кнопку Перезагрузить"
        textContainer(head, text, true);
      }
    });
    portOpen = false;
  },1000);
};

$('#button_restart').on('click', function() {

  chrome.runtime.reload();
});



//закрытие порта
function portClosing(){
	serialPort.close(function (err) {
		console.log('port closed', err);
   if (!(err === undefined)) {
    $('#button_window').css('display', 'none');
    $('#button_restart').css('display', 'block');
    $('.sea').css('display', 'block');
    let head = "Упс... Что-то пошло не так..."
    let text = "Переподключите плату к компьютеру, затем нажмите на кнопку Перезагрузить"
    textContainer(head, text, true);
  }
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

	}, 10000);

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
else{ //убрать чек
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
/*
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

/*
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
 fs.writeFileSync('allan1.json',JSON.stringify({allan}, null, 4));


}*/
};

function checkMatching(arr){
	let array = [[],[],[],[],[],[]];
	let y = 0;
	for(let i = 0; i < meanResuts.length; i++ ){
		if(meanResuts[i].length != 0){
			array[y].push(meanResuts[i]);
			y++;
		}

	};
	for(let i = 0; i < array.length; i++){
		if(array[i].length != 0){
			for(let j = 0; j < 3; j++){
				if(+arrayMean[0] >= 0.8 && +array[i][0][j] >= 0.8 || +arrayMean[0] <= -0.8 && +array[i][0][j] <= -0.8){
					if(arrayMean[1] == j){
						let header = "Данные из этого положения были уже считаны!";
						let text1 = "Положите датчик еще раз в положение ";
						let text2 = " и нажмите на кнопку 'Начать сбор данных'"

						textContainer(header, text1, text2, false);
						checkPass = false;
						break;
					}
				}
			}
			if(!checkPass) {
				break;}
			}
		}
		newArrCheck.splice(0, newArrCheck.length);

		for (let i = 0; i < arrayMean.length; i++) {
			arrayMean[i] = [0];
		}
	};

	function textContainer(head, text1, text2, check){
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

	function meanValue(index, arr){
		var row = -1;
		var y = index;
		row ++;
		var dataColibration;
		if(arr) {
			dataColibration = arr;
		}
		else dataColibration =  newArr[y];
		dataColibration.shift();
		dataColibration.pop();
		if(calibrationCheck[1]){
			for (let i = 0; i < dataColibration.length; i++) {
				let buf = dataColibration[i].split(';');
				buf = buf.slice(3, 6);
				magnitron.sortArr.x.push(+buf[0]); 
				magnitron.sortArr.y.push(+buf[1]); 
				magnitron.sortArr.z.push(+buf[2]); 
			}
			magnetometrCalibration(magnitron);
		}
		else{
            //console.log(dataColibration);
            for(let j =0; j < 3; j++) {
            	for (let i = 0; i < dataColibration.length; i++) {

            		let buf = dataColibration[i].split(';');
            		if(calibrationCheck[0]){
            			buf = buf.slice(0, 3);
                //вторичная проверкаб проверяя непосредственно значение каждого положения
                if (+buf[j] >= -1.5 && +buf[j] <= 1.5) {
                      //запись в массив значений по первому столбцу
                      arrayPos.push(buf[j]);
                    }
                    else {
                    }
                  }

                }
          //если идет проверка магнитометра
          if(calibrationCheck[1]){
           //plotRouting();
         }
          //если идет проверка аксел
          else{
                  //console.log( "среднее значение: " + math.mean(arrayPos));
                  //средняя велечина первого столба с последующим округлением
                  meanResuts[y].push((math.mean(arrayPos)).toFixed(3));
                  //очищение массива
                  arrayPos.splice(0, arrayPos.length);
//после проверки всех положений для каждой из осей (всего 6 позиций), их сортировки, запускается непосредственно калибровка акселерометра
if(y >= 5) {
 setTimeout(function() { 
  calibrationCheck[0] = false;
  console.log( meanResuts);
  positionDedect();
  setTimeout(function() { 
   calibration();
 }, 1000);
}, 1000);
}
}
}
}
};

function chesck(){
              //meanValue();
            }



//проверка на положение датчика для дальнейшей калибровки
function positionDedect(){
	let buf = 0;
	console.log('test');
	for(let i = 0; i < 3; i++){
		for(let y = 0; y < 6; y++){
			if(+meanResuts[y][i] >= 0.9 && +meanResuts[y][i] <= 1.2){
				if(i==0){
					buf = meanResuts[0];
					meanResuts[0] = meanResuts[y];
					meanResuts[y] = buf;
				}
				else if(i==1){
					buf = meanResuts[2];
					meanResuts[2] = meanResuts[y];
					meanResuts[y] = buf;
				}
				else if(i==2){
					buf = meanResuts[4];
					meanResuts[4] = meanResuts[y];
					meanResuts[y] = buf;
				}
			}
			else if(+meanResuts[y][i] <= -0.9 && +meanResuts[y][i] >= -1.2){
				if(i==0){
					buf = meanResuts[1];
					meanResuts[1] = meanResuts[y];
					meanResuts[y] = buf;
				}
				else if(i==1){
					buf = meanResuts[3];
					meanResuts[3] = meanResuts[y];
					meanResuts[y] = buf;
				}
				else if(i==2){
					buf = meanResuts[5];
					meanResuts[5] = meanResuts[y];
					meanResuts[y] = buf;
				}
			}
		}

	}
	console.log(meanResuts);
	console.log();
}


//прием запросов с сервера: с пометкой "check" (значит, нужен будет сбор данных) и все остальные запросы для которых идет обычная обработка 
function requestRecieve(arg){
  //app.post('/', function(req, res){
  	var obj = {};
    //такой-то параметр
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
   //проверка: закрыт ли порт
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
        	$('.section2 .log').css({
        		display: 'none'
        	});
        	$('.wrapMatrix #matrix').css({
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

speedInputMag.onchange = function() {
	magnitron.time = speedInputMag.value;
};


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

/*
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
*/


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
	text.innerHTML = "На данной странице можно провести калибровку акселерометра и магнитометра. Для начала нужно обязательно выбрать порт, с которого будут считваться данные. Для этого нужно нажать на кнопку 'Настройки'. Далее можно начать калибровку акселерометра, установив его в первом моложении и нажав на кнопку 'Начать сбор данных', или провести калибровку магнитометра, котрая находится в низу страницы, во втором ряду блоков. ";
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

//Нажатие на кнопку "Начать сбор данных"
scan.onclick = function(){
	calibrationCheck[0] = true;
	if(checkIndex<=6){
		requestRecieve(scanTest);

	}
}




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
	}, 300);
});

$(function(){



	$('#clickcalibration').click(function(){
//параметры соединения (порт платы)
requestRecieve(data);

//Открытие всплывающего окна с подсказками
setTimeout(function () {
	$(function(){
		$('html, body').animate({
			//scrollTop: $(".block1").offset().top - 50
		}, 2000);
	});
},1000);


//всплывающие подсказки
head_window.innerHTML = "Что делать дальше?"
text.innerHTML = "Положите датчик в положение " + click + " и нажмите на кнопку 'Начать сбор данных' или же начните калибровку магнитометра, опустившись в нижнюю часть страницы";
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

//Распределение матрицы Kx по столбцам на сайте
function coeffMatrixSet(){
	let row = document.getElementsByClassName('row');
	let rowElements = document.getElementsByClassName('element');
	let coefficientMatrix = document.getElementsByClassName('coeff');
  $('#coefficient').css('display', 'flex !important');

      //matrix = JSON.parse(xhrReqMatrix.responseText);
      let y = 0;
      for( let i = 0; i <matrixReady.length; i++){
      	if(i == 9){
      		coefficientMatrix[y].innerHTML = '(' +  + matrixReady[i] + '';
      		y++;
      	}
      	else if(i == 10) {
      		coefficientMatrix[y].innerHTML = '' +  + matrixReady[i] + '';
      		y++;
      	}
      	else if(i == 11) {
      		coefficientMatrix[y].innerHTML = '' +  + matrixReady[i] + ')';
      		y++;
      	}
      	else rowElements[i].innerHTML = '' +  + matrixReady[i] + '';
      }
      $(".bracketL").css("height", $('#matrix').height());
      $(".bracketR").css("height", $('#matrix').height());
      //console.log(xhrReqMatrix.responseText); 
    }


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




function listCheck(){}
