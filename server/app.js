var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var path = require("path");
var fs = require('fs');
var bodyParser = require('body-parser');
var math = require('mathjs');
var lsq = require('least-squares');
math.config({
  number: 'number'
});

var portsNum = [], SerialPortCheck = false, thermodata = [], settingsCOM, parsedSettings, arrayPos = [], arrayBuff = [] ;
var meanResuts = [[],[],[],[],[],[]];
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


var allan = 0;

var SerialPort = require("serialport");
var angles = 0, timer, portOpen = false, COM, Input,serialPort, anglesArray = [], i =0, check = 1;

app.use(express.static('views'));
app.use(bodyParser.json({limit:5024102420, type:'application/json'}));

var arr;
var serverCheck = 0;

let ic = 0;

app.post("/sendmessage", function(request, response) {
  response.redirect('back');
  response.end('It worked!');

  function plotRouting(){
//Локально! Аппроксимация карты, касательные к графику

//аппроксимированные данные расчитанной вариации Аллана(ВА) для датчиков
var acs = {
  x: [],
  y: [],
  z: [],
  time: []
};
var mag = {
  x: [],
  y: [],
  z: [],
  time: []
};
var giro = {
  x: [],
  y: [],
  z: [],
  time: []
};

//полные данные ВА для датчиков
var magMain = {
  x: [],
  y: [],
  z: [],
  time: []
};
var acsMain = {
  x: [],
  y: [],
  z: [],
  time: []
};
var giroMain = {
  x: [],
  y: [],
  z: [],
  time: []
};

var line = {
  x: [],
  y: []
}
//var tangetA = +acs.x[0] - arr.allanVar.Time[0];
var coefA = {
  x: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  },
  y: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  },
  z: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  }
};
var coefM = {
  x: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  },
  y: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  },
  z: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  }
};
var coefG = {
  x: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  },
  y: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  },
  z: {
    A: [],
    B: [],
    C: [],
    D: [],
    E: []
  }
};

//шаблон для характерных точек 
function mapObj() {
  this.k = [],
  this.time = [],
  this.quant = 0,
  this.bias = 0,
  this.biasEnd = 0,
  this.walk = 0,
  this.walkEnd = 0,
  this.ramp = 0,
  this.rampEnd = 0
}
;

//карта с характерными точками для акседерометра 
var mapAX = new mapObj();
var mapAY = new mapObj();
var mapAZ = new mapObj();

//карта с характерными точками для магнитометра 
var mapMX = new mapObj();
var mapMY = new mapObj();
var mapMZ = new mapObj();

//карта с характерными точками для гироскопа 
var mapGX = new mapObj();
var mapGY = new mapObj();
var mapGZ = new mapObj();

//массивы, содержащие  объекты, описывающие точки для построения касательных к графику ВА для каждого из шумовых составляющих
var finalArrAx = [];
var finalArrAy = [];
var finalArrAz = [];

var finalArrMx = [];
var finalArrMy = [];
var finalArrMz = [];

var finalArrGx = [];
var finalArrGy = [];
var finalArrGz = [];

//временные точки для определения касательных
var arrPointAx = [];
var arrPointAy = [];
var arrPointAz = [];

var arrPointMx = [];
var arrPointMy = [];
var arrPointMz = [];

var arrPointGx = [];
var arrPointGy = [];
var arrPointGz = [];


var arrPoint = [];

function objPoints(arr) {
  this.x0 = arr[0];
  this.y0 = arr[1];
  this.x1 = arr[2];
  this.y1 = arr[3];
  this.check = 0;
}

//коэффициенты наклона 
let m = [-1, -0.5, 0, 0.5, 1];

//аппроксимация значений вариации Аллана

  for (let i = 0; i < 70000; i++) {
        /*   if(i < 526){
        acs.x.push(arr.allanVar.AX[i]);
        acs.y.push(arr.allanVar.AY[i]);
        acs.z.push(arr.allanVar.AZ[i]);

        mag.x.push(arr.allanVar.MX[i]);
        mag.y.push(arr.allanVar.MY[i]);
        mag.z.push(arr.allanVar.MZ[i]);

        giro.x.push(arr.allanVar.GX[i]);
        giro.y.push(arr.allanVar.GY[i]);
        giro.z.push(arr.allanVar.GZ[i]);
      }
      else if(i < 7444){
        acs.x.push(arr.allanVar.AX[i]);
        acs.y.push(arr.allanVar.AY[i]);
        acs.z.push(arr.allanVar.AZ[i]);

        giro.x.push(arr.allanVar.GX[i]);
        giro.y.push(arr.allanVar.GY[i]);
        giro.z.push(arr.allanVar.GZ[i]);
      }
      */

      /* Усредненные данные для анализа графика*/
      if (i < 4) {
        if (i % 1 == 0) {
          acs.x.push(arr.allanVar.AX[i]);
          acs.y.push(arr.allanVar.AY[i]);
          acs.z.push(arr.allanVar.AZ[i]);

          mag.x.push(arr.allanVar.MX[i]);
          mag.y.push(arr.allanVar.MY[i]);
          mag.z.push(arr.allanVar.MZ[i]);

          giro.x.push(arr.allanVar.GX[i]);
          giro.y.push(arr.allanVar.GY[i]);
          giro.z.push(arr.allanVar.GZ[i]);

          acs.time.push(arr.allanVar.Time[i]);
          giro.time.push(arr.allanVar.Time[i]);
          mag.time.push(arr.allanVar.Time[i]);
        }
      } else if (i < 605) {
        if (i % 200 == 0) {
          acs.x.push(arr.allanVar.AX[i]);
          acs.y.push(arr.allanVar.AY[i]);
          acs.z.push(arr.allanVar.AZ[i]);

          mag.x.push(arr.allanVar.MX[i]);
          mag.y.push(arr.allanVar.MY[i]);
          mag.z.push(arr.allanVar.MZ[i]);

          giro.x.push(arr.allanVar.GX[i]);
          giro.y.push(arr.allanVar.GY[i]);
          giro.z.push(arr.allanVar.GZ[i]);

          acs.time.push(arr.allanVar.Time[i]);
          giro.time.push(arr.allanVar.Time[i]);
          mag.time.push(arr.allanVar.Time[i]);
        }
      } else if (i < 10000) {
        if (i % 2500 == 0) {
          acs.x.push(arr.allanVar.AX[i]);
          acs.y.push(arr.allanVar.AY[i]);
          acs.z.push(arr.allanVar.AZ[i]);

          mag.x.push(arr.allanVar.MX[i]);
          mag.y.push(arr.allanVar.MY[i]);
          mag.z.push(arr.allanVar.MZ[i]);

          giro.x.push(arr.allanVar.GX[i]);
          giro.y.push(arr.allanVar.GY[i]);
          giro.z.push(arr.allanVar.GZ[i]);

          acs.time.push(arr.allanVar.Time[i]);
          giro.time.push(arr.allanVar.Time[i]);
          mag.time.push(arr.allanVar.Time[i]);
        }
      } else if (i < 40000) {
        if (i % 10000 == 0) {

          acs.x.push(arr.allanVar.AX[i]);
          acs.y.push(arr.allanVar.AY[i]);
          acs.z.push(arr.allanVar.AZ[i]);

          mag.x.push(arr.allanVar.MX[i]);
          mag.y.push(arr.allanVar.MY[i]);
          mag.z.push(arr.allanVar.MZ[i]);

          giro.x.push(arr.allanVar.GX[i]);
          giro.y.push(arr.allanVar.GY[i]);
          giro.z.push(arr.allanVar.GZ[i]);

          acs.time.push(arr.allanVar.Time[i]);
          giro.time.push(arr.allanVar.Time[i]);
          mag.time.push(arr.allanVar.Time[i]);
        }
      } else {
        if (i % 20000 == 0) {
          let Acx = 0;
          let Acy = 0;
          let Acz = 0;
          for(let y = i - 4000; y < i + 4000; y++){
            Acx += arr.allanVar.AX[i];
            Acy += arr.allanVar.AX[i];
            Acz += arr.allanVar.AX[i];
          }
          Acx /= 8000;
          Acy /= 8000;
          Acz /= 8000;

          acs.x.push( Acx);
          acs.y.push( Acy);
          acs.z.push( Acz);

          giro.x.push(arr.allanVar.GX[i]);
          giro.y.push(arr.allanVar.GY[i]);
          giro.z.push(arr.allanVar.GZ[i]);

          acs.time.push(arr.allanVar.Time[i]);
          giro.time.push(arr.allanVar.Time[i]);
        }
      }

      acsMain.x.push(arr.allanVar.AX[i]);
      acsMain.y.push(arr.allanVar.AY[i]);
      acsMain.z.push(arr.allanVar.AZ[i]);
      acsMain.time.push(arr.allanVar.Time[i]);

      if (i < 44000) {
        magMain.x.push(arr.allanVar.MX[i]);
        magMain.y.push(arr.allanVar.MY[i]);
        magMain.z.push(arr.allanVar.MZ[i]);
        magMain.time.push(arr.allanVar.Time[i]);
      }
      giroMain.x.push(arr.allanVar.GX[i]);
      giroMain.y.push(arr.allanVar.GY[i]);
      giroMain.z.push(arr.allanVar.GZ[i]);
      giroMain.time.push(arr.allanVar.Time[i]);

    }
  

  console.log("Разбивка массива завершена");


//создание карты для всех датчиков на основе упрощенной версии(аппроксимированной)

    //создание карты для акселерометра
    for (let z = 0; z < 3; z++) {
      for (let i = 0; i < acs.x.length - 1; i++) {
        var ar = [acs.x, acs.y, acs.z];
        let m1 = +((Math.log10(ar[z][i + 1]) - Math.log10(ar[z][i])) / (Math.log10(acs.time[i + 1]) - Math.log10(acs.time[i]))).toFixed(5);
        switch (z) {
          case 0:
          mapAX.k.push(m1);
          mapAX.time.push(acs.time[i]);
          break;
          case 1:
          mapAY.k.push(m1);
          mapAY.time.push(acs.time[i]);
          break;
          case 2:
          mapAZ.k.push(m1);
          mapAZ.time.push(acs.time[i]);
          break;
        }

      }
      let exp = 0;
      if (z == 0) {

        while (mapAX.k[exp] < 0)
          exp++
        mapAX.quant = mapAX.time[exp - 1];

        while (mapAX.bias == 0) {
          mapAX.bias = mapAX.time[exp];
          mapAX.biasEnd = mapAX.time[exp+1];
          if (Math.abs(mapAX.k[exp+1]) < 0.15) {
            mapAX.bias = mapAX.time[exp];
            mapAX.biasEnd = mapAX.time[exp+2];
          }
          exp++;
        }
        while (mapAX.walk == 0) {
          if (Math.abs(0.5 - mapAX.k[exp]) < 0.25 && mapAX.k[exp] > 0 && (acs.x[exp] - acs.x[mapAX.time.indexOf(mapAX.bias)] > 0)) {
            mapAX.walk = mapAX.time[exp];
            mapAX.walkEnd = mapAX.time[exp+1];
            if (Math.abs(0.5 - mapAX.k[exp+1]) < 0.25 && mapAX.k[exp+1] > 0 && (acs.x[exp+1] - acs.x[mapAX.time.indexOf(mapAX.bias)] > 0)) {
              mapAX.walk = mapAX.time[exp+1];
              mapAX.walkEnd = mapAX.time[exp+2];
            }
          }
          if (exp + 1 >= mapAX.k.length) {
            break;
          }
          exp++; 
        }
        while (mapAX.ramp == 0 && exp != mapAX.k.length) {
          if (mapAX.k[exp] >= 0.7 && mapAX.k[exp] < 2) {
            mapAX.ramp = mapAX.time[exp];
            if (acs.x[mapAX.time.indexOf(mapAX.ramp) + 1] - acs.x[mapAX.time.indexOf(mapAX.bias)] < 0.00012) {
              mapAX.rampEnd = false;
            } else
            mapAX.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapAX.k.length)
            break;
          exp++;
        }
        exp = 0;
      } else if (z == 1) {


        while (mapAY.k[exp] < 0)
          exp++
        mapAY.quant = mapAY.time[exp - 1];

        while (mapAY.bias == 0) {
          mapAY.bias = mapAY.time[exp];
          mapAY.biasEnd = mapAY.time[exp+1];
          if (Math.abs(mapAY.k[exp+1]) < 0.15) {
            mapAY.bias = mapAY.time[exp];
            mapAY.biasEnd = mapAY.time[exp+2];
          }
          exp++;
        }
        while (mapAY.walk == 0) {
          if (Math.abs(0.5 - mapAY.k[exp]) < 0.25 && mapAY.k[exp] > 0 && (acs.y[exp] - acs.y[mapAY.time.indexOf(mapAY.bias)] > 0)) {
            mapAY.walk = mapAY.time[exp];
            mapAY.walkEnd = mapAY.time[exp+1];
            if (Math.abs(0.5 - mapAY.k[exp+1]) < 0.25 && mapAY.k[exp+1] > 0 && (acs.y[exp+1] - acs.y[mapAY.time.indexOf(mapAY.bias)] > 0)) {
              mapAY.walk = mapAY.time[exp+1];
              mapAY.walkEnd = mapAY.time[exp+2];
            }
          }
          if (exp + 1 >= mapAY.k.length) {
            break;
          }
          exp++; 
        }
        while (mapAY.ramp == 0 && exp != mapAY.k.length) {
          if (mapAY.k[exp] >= 0.7 && mapAY.k[exp] < 2) {
            mapAY.ramp = mapAY.time[exp];
            if (acs.y[mapAY.time.indexOf(mapAY.ramp) + 1] - acs.y[mapAY.time.indexOf(mapAY.bias)] < 0.00012) {
              mapAY.rampEnd = false;
            } else
            mapAY.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapAY.k.length)
            break;
          exp++;
        }
        exp = 0;
      }
      else if (z == 2) {


        while (mapAZ.k[exp] < 0)
          exp++
        mapAZ.quant = mapAZ.time[exp - 1];

        while (mapAZ.bias == 0) {
          mapAZ.bias = mapAZ.time[exp];
          mapAZ.biasEnd = mapAZ.time[exp+1];
          if (Math.abs(mapAZ.k[exp+1]) < 0.15) {
            mapAZ.bias = mapAZ.time[exp];
            mapAZ.biasEnd = mapAZ.time[exp+2];
          }
          exp++;
        }
        while (mapAZ.walk == 0) {
          if (Math.abs(0.5 - mapAZ.k[exp]) < 0.25 && mapAZ.k[exp] > 0 && (acs.z[exp] - acs.z[mapAZ.time.indexOf(mapAZ.bias)] > 0)) {
            mapAZ.walk = mapAZ.time[exp];
            mapAZ.walkEnd = mapAZ.time[exp+1];
            if (Math.abs(0.5 - mapAZ.k[exp+1]) < 0.25 && mapAZ.k[exp+1] > 0 && (acs.z[exp+1] - acs.z[mapAZ.time.indexOf(mapAZ.bias)] > 0)) {
              mapAZ.walk = mapAZ.time[exp+1];
              mapAZ.walkEnd = mapAZ.time[exp+2];
            }
          }
          if (exp + 1 >= mapAZ.k.length) {
            break;
          }
          exp++; 
        }
        while (mapAZ.ramp == 0 && exp != mapAZ.k.length) {
          if (mapAZ.k[exp] >= 0.7 && mapAZ.k[exp] < 2) {
            mapAZ.ramp = mapAZ.time[exp];
            if (acs.z[mapAZ.time.indexOf(mapAZ.ramp) + 1] - acs.z[mapAZ.time.indexOf(mapAZ.bias)] < 0.00012) {
              mapAZ.rampEnd = false;
            } else
            mapAZ.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapAZ.k.length)
            break;
          exp++;
        }
        exp = 0;

      }
    }

    //создание карты для магнитометра
    for (let z = 0; z < 3; z++) {
      for (let i = 0; i < mag.x.length - 1; i++) {
        var ar = [mag.x, mag.y, mag.z];
        let m1 = +((Math.log10(ar[z][i + 1]) - Math.log10(ar[z][i])) / (Math.log10(mag.time[i + 1]) - Math.log10(mag.time[i]))).toFixed(5);
        switch (z) {
          case 0:
          mapMX.k.push(m1);
          mapMX.time.push(mag.time[i]);
          break;
          case 1:
          mapMY.k.push(m1);
          mapMY.time.push(mag.time[i]);
          break;
          case 2:
          mapMZ.k.push(m1);
          mapMZ.time.push(mag.time[i]);
          break;
        }

      }
      let exp = 0;
      if (z == 0) {


        while (mapMX.k[exp] < 0)
          exp++
        mapMX.quant = mapMX.time[exp - 1];

        while (mapMX.bias == 0) {
          mapMX.bias = mapMX.time[exp];
          mapMX.biasEnd = mapMX.time[exp+1];
          if (Math.abs(mapMX.k[exp+1]) < 0.15) {
            mapMX.bias = mapMX.time[exp];
            mapMX.biasEnd = mapMX.time[exp+2];
          }
          exp++;
        }
        while (mapMX.walk == 0) {
          if (Math.abs(0.5 - mapMX.k[exp]) < 0.25 && mapMX.k[exp] > 0 && (mag.x[exp] - mag.x[mapMX.time.indexOf(mapMX.bias)] > 0)) {
            mapMX.walk = mapMX.time[exp];
            mapMX.walkEnd = mapMX.time[exp+1];
            if (Math.abs(0.5 - mapMX.k[exp+1]) < 0.25 && mapMX.k[exp+1] > 0 && (mag.x[exp+1] - mag.x[mapMX.time.indexOf(mapMX.bias)] > 0)) {
              mapMX.walk = mapMX.time[exp+1];
              mapMX.walkEnd = mapMX.time[exp+2];
            }
          }
          if (exp + 1 >= mapMX.k.length) {
            break;
          }
          exp++; 
        }
        while (mapMX.ramp == 0 && exp != mapMX.k.length) {
          if (mapMX.k[exp] >= 0.7 && mapMX.k[exp] < 2) {
            mapMX.ramp = mapMX.time[exp];
            if (mag.x[mapMX.time.indexOf(mapMX.ramp) + 1] - mag.x[mapMX.time.indexOf(mapMX.bias)] < 0.00012) {
              mapMX.rampEnd = false;
            } else
            mapMX.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapMX.k.length)
            break;
          exp++;
        }
        exp = 0;

      } else if (z == 1) {


        while (mapMY.k[exp] < 0)
          exp++
        mapMY.quant = mapMY.time[exp - 1];

        while (mapMY.bias == 0) {
          mapMY.bias = mapMY.time[exp];
          mapMY.biasEnd = mapMY.time[exp+1];
          if (Math.abs(mapMY.k[exp+1]) < 0.15) {
            mapMY.bias = mapMY.time[exp];
            mapMY.biasEnd = mapMY.time[exp+2];
          }
          exp++;
        }
        while (mapMY.walk == 0) {
          if (Math.abs(0.5 - mapMY.k[exp]) < 0.25 && mapMY.k[exp] > 0 && (mag.y[exp] - mag.y[mapMY.time.indexOf(mapMY.bias)] > 0)) {
            mapMY.walk = mapMY.time[exp];
            mapMY.walkEnd = mapMY.time[exp+1];
            if (Math.abs(0.5 - mapMY.k[exp+1]) < 0.25 && mapMY.k[exp+1] > 0 && (mag.y[exp+1] - mag.y[mapMY.time.indexOf(mapMY.bias)] > 0)) {
              mapMY.walk = mapMY.time[exp+1];
              mapMY.walkEnd = mapMY.time[exp+2];
            }
          }
          if (exp + 1 >= mapMY.k.length) {
            break;
          }
          exp++; 
        }
        while (mapMY.ramp == 0 && exp != mapMY.k.length) {
          if (mapMY.k[exp] >= 0.7 && mapMY.k[exp] < 2) {
            mapMY.ramp = mapMY.time[exp];
            if (mag.y[mapMY.time.indexOf(mapMY.ramp) + 1] - mag.y[mapMY.time.indexOf(mapMY.bias)] < 0.00012) {
              mapMY.rampEnd = false;
            } else
            mapMY.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapMY.k.length)
            break;
          exp++;
        }
        exp = 0;
      }
      else if (z == 2) {


        while (mapMZ.k[exp] < 0)
          exp++
        mapMZ.quant = mapMZ.time[exp - 1];

        while (mapMZ.bias == 0) {
          mapMZ.bias = mapMZ.time[exp];
          mapMZ.biasEnd = mapMZ.time[exp+1];
          if (Math.abs(mapMZ.k[exp+1]) < 0.15) {
            mapMZ.bias = mapMZ.time[exp+1];
            mapMZ.biasEnd = mapMZ.time[exp+2];
          }
          exp++;
        }
        while (mapMZ.walk == 0) {
          if (Math.abs(0.5 - mapMZ.k[exp]) < 0.25 && mapMZ.k[exp] > 0 && (mag.z[exp] - mag.z[mapMZ.time.indexOf(mapMZ.bias)] > 0)) {
            mapMZ.walk = mapMZ.time[exp];
            mapMZ.walkEnd = mapMZ.time[exp+1];
            if (Math.abs(0.5 - mapMZ.k[exp+1]) < 0.25 && mapMZ.k[exp+1] > 0 && (mag.z[exp+1] - mag.z[mapMZ.time.indexOf(mapMZ.bias)] > 0)) {
              mapMZ.walk = mapMZ.time[exp+1];
              mapMZ.walkEnd = mapMZ.time[exp+2];
            }
          }
          if (exp + 1 >= mapMZ.k.length) {
            break;
          }
          exp++; 
        }
        while (mapMZ.ramp == 0 && exp != mapMZ.k.length) {
          if (mapMZ.k[exp] >= 0.7 && mapMZ.k[exp] < 2) {
            mapMZ.ramp = mapMZ.time[exp];
            if (mag.z[mapMZ.time.indexOf(mapMZ.ramp) + 1] - mag.z[mapMZ.time.indexOf(mapMZ.bias)] < 0.00012) {
              mapMZ.rampEnd = false;
            } else
            mapMZ.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapMZ.k.length)
            break;
          exp++;
        }
        exp = 0;

      }

    }

    //создание карты для гироскопа
    for (let z = 0; z < 3; z++) {
      for (let i = 0; i < giro.x.length - 1; i++) {
        var ar = [giro.x, giro.y, giro.z];
        let m1 = +((Math.log10(ar[z][i + 1]) - Math.log10(ar[z][i])) / (Math.log10(giro.time[i + 1]) - Math.log10(giro.time[i]))).toFixed(5);
        switch (z) {
          case 0:
          mapGX.k.push(m1);
          mapGX.time.push(giro.time[i]);
          break;
          case 1:
          mapGY.k.push(m1);
          mapGY.time.push(giro.time[i]);
          break;
          case 2:
          mapGZ.k.push(m1);
          mapGZ.time.push(giro.time[i]);
          break;
        }

      }
      let exp = 0;
      if (z == 0) {


        while (mapGX.k[exp] < 0)
          exp++
        mapGX.quant = mapGX.time[exp - 1];

        while (mapGX.bias == 0) {
          mapGX.bias = mapGX.time[exp];
          mapGX.biasEnd = mapGX.time[exp+1];
          if (Math.abs(mapGX.k[exp+1]) < 0.15) {
            mapGX.bias = mapGX.time[exp+1];
            mapGX.biasEnd = mapGX.time[exp+2];
          }
          exp++;
        }
        while (mapGX.walk == 0) {
          if (Math.abs(0.5 - mapGX.k[exp]) < 0.25 && mapGX.k[exp] > 0 && (giro.x[exp] - giro.x[mapGX.time.indexOf(mapGX.bias)] > 0)) {
            mapGX.walk = mapGX.time[exp];
            mapGX.walkEnd = mapGX.time[exp+1];
            if (Math.abs(0.5 - mapGX.k[exp+1]) < 0.25 && mapGX.k[exp+1] > 0 && (giro.x[exp+1] - giro.x[mapGX.time.indexOf(mapGX.bias)] > 0)) {
              mapGX.walk = mapGX.time[exp+1];
              mapGX.walkEnd = mapGX.time[exp+2];
            }
          }
          if (exp + 1 >= mapGX.k.length) {
            break;
          }
          exp++; 
        }
        while (mapGX.ramp == 0 && exp != mapGX.k.length) {
          if (mapGX.k[exp] >= 0.67 && mapGX.k[exp] < 2) {
            mapGX.ramp = mapGX.time[exp];
            if (giro.x[mapGX.time.indexOf(mapGX.ramp) + 1] - giro.x[mapGX.time.indexOf(mapGX.bias)] < 0.00012) {
              mapGX.rampEnd = false;
            } else
            mapGX.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapGX.k.length)
            break;
          exp++;
        }
        exp = 0;
      } else if (z == 1) {


        while (mapGY.k[exp] < 0)
          exp++
        mapGY.quant = mapGY.time[exp - 1];

        while (mapGY.bias == 0) {
          mapGY.bias = mapGY.time[exp];
          mapGY.biasEnd = mapGY.time[exp+1];
          if (Math.abs(mapGY.k[exp+1]) < 0.15) {
            mapGY.bias = mapGY.time[exp+1];
            mapGY.biasEnd = mapGY.time[exp+2];
          }
          exp++;
        }
        while (mapGY.walk == 0) {
          if (Math.abs(0.5 - mapGY.k[exp]) < 0.25 && mapGY.k[exp] > 0 && (giro.y[exp] - giro.y[mapGY.time.indexOf(mapGY.bias)] > 0)) {
            mapGY.walk = mapGY.time[exp];
            mapGY.walkEnd = mapGY.time[exp+1];
            if (Math.abs(0.5 - mapGY.k[exp+1]) < 0.25 && mapGY.k[exp+1] > 0 && (giro.y[exp+1] - giro.y[mapGY.time.indexOf(mapGY.bias)] > 0)) {
              mapGY.walk = mapGY.time[exp+1];
              mapGY.walkEnd = mapGY.time[exp+2];
            }
          }
          if (exp + 1 >= mapGY.k.length) {
            if(mapGY.k[exp]>0){
              mapGY.walk = mapGY.time[exp];
              mapGY.walkEnd = acs.time[exp + 1];
              exp++;
            }
            break;
          }
          exp++; 
        }
        while (mapGY.ramp == 0 && exp != mapGY.k.length) {
          if (mapGY.k[exp] >= 0.67 && mapGY.k[exp] < 2) {
            mapGY.ramp = mapGY.time[exp];
            if (giro.y[mapGY.time.indexOf(mapGY.ramp) + 1] - giro.y[mapGY.time.indexOf(mapGY.bias)] < 0.00012) {
              mapGY.rampEnd = false;
            } else
            mapGY.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapGY.k.length)
            exp++;
        }
        exp = 0;
      }
      else if (z == 2) {
        while (mapGZ.k[exp] < 0)
          exp++
        mapGZ.quant = mapGZ.time[exp - 1];

        while (mapGZ.bias == 0) {
          mapGZ.bias = mapGZ.time[exp];
          mapGZ.biasEnd = mapGZ.time[exp+1];
          if (Math.abs(mapGZ.k[exp+1]) < 0.15) {
            mapGZ.bias = mapGZ.time[exp+1];
            mapGZ.biasEnd = mapGZ.time[exp+2];
          }
          exp++;
        }
        while (mapGZ.walk == 0) {
          if (Math.abs(0.5 - mapGZ.k[exp]) < 0.25 && mapGZ.k[exp] > 0 && (giro.z[exp] - giro.z[mapGZ.time.indexOf(mapGZ.bias)] > 0)) {
            mapGZ.walk = mapGZ.time[exp];
            mapGZ.walkEnd = mapGZ.time[exp+1];
            if (Math.abs(0.5 - mapGZ.k[exp+1]) < 0.25 && mapGZ.k[exp+1] > 0 && (giro.z[exp+1] - giro.z[mapGZ.time.indexOf(mapGZ.bias)] > 0)) {
              mapGZ.walk = mapGZ.time[exp+1];
              mapGZ.walkEnd = mapGZ.time[exp+2];
            }
          }
          if (exp + 1 >= mapGZ.k.length) {
            if(mapGZ.k[exp]>0){
              mapGZ.walk = mapGZ.time[exp];
              mapGZ.walkEnd = acs.time[exp + 1];
              exp++;
            }
            break;
          }
          exp++; 
        }
        while (mapGZ.ramp == 0 && exp != mapGZ.k.length) {
          if (mapGZ.k[exp] >= 0.67 && mapGZ.k[exp] < 2) {
            mapGZ.ramp = mapGZ.time[exp];
            if (giro.y[mapGZ.time.indexOf(mapGZ.ramp) + 1] - giro.z[mapGZ.time.indexOf(mapGZ.bias)] < 0.00012) {
              mapGZ.rampEnd = false;
            } else
            mapGZ.rampEnd = acs.time[exp + 1];
          }
          if (exp + 1 >= mapGZ.k.length)
            exp++;
        }
        exp = 0;

        }
      }
      


      console.log("Разбивка карты завершена");
//расчет коэффициентов для всех датчиков

    //первый коэффициент для акселерометра
    for (let i = 0; i < mapAX.quant; i++) {
        //конечная точка для прямой
        let xAx = (Math.log10(0.00005) - Math.log10(acsMain.x[i]) + (Math.log10(acsMain.time[i])) * m[0]) / (m[0]);
        let bx = Math.log10(acsMain.x[i]) - m[0] * Math.log10(acsMain.time[i]);

        let xAy = (Math.log10(0.00005) - Math.log10(acsMain.y[i]) + (Math.log10(acsMain.time[i])) * m[0]) / (m[0]);
        let by = Math.log10(acsMain.y[i]) - m[0] * Math.log10(acsMain.time[i]);

        let xAz = (Math.log10(0.00005) - Math.log10(acsMain.z[i]) + (Math.log10(acsMain.time[i])) * m[0]) / (m[0]);
        let bz = Math.log10(acsMain.z[i]) - m[0] * Math.log10(acsMain.time[i]);
        //все параметры для этой точки
        var pointAx = new objPoints([acsMain.time[i], acsMain.x[i], (Math.pow(10, xAx)), 0.00005]);

        var pointAy = new objPoints([acsMain.time[i], acsMain.y[i], (Math.pow(10, xAy)), 0.00005]);

        var pointAz = new objPoints([acsMain.time[i], acsMain.z[i], (Math.pow(10, xAz)), 0.00005]);

        for (let y = 1; y < mapAX.quant; y++) {
          let Xposx = acsMain.time[y];

            //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
            let checkX = m[0] * Math.log10(Xposx) + bx;

            let checkY = m[0] * Math.log10(Xposx) + by;

            let checkZ = m[0] * Math.log10(Xposx) + bz;

            let numX = Math.pow(10, checkX);

            let numY = Math.pow(10, checkY);

            let numZ = Math.pow(10, checkZ);

            if (numX > acsMain.x[y]) {
              pointAx.check += 1;
            }

            if (numY > acsMain.y[y]) {
              pointAy.check += 1;
            }

            if (numZ > acsMain.z[y]) {
              pointAz.check += 1;
            }

          }
          if (pointAx.check == 0 && !finalArrAx[0]) {
            finalArrAx.push(pointAx);
          } else {
            arrPointAx.push(pointAx);
          }

          if (pointAy.check == 0 && !finalArrAy[0]) {
            finalArrAy.push(pointAy);
          } else {
            arrPointAy.push(pointAy);
          }

          if (pointAz.check == 0 && !finalArrAz[0]) {
            finalArrAz.push(pointAz);
            break;
          } else {
            arrPointAz.push(pointAz);
          }
        }

        arrPointAx.length = 0;

        arrPointAy.length = 0;

        arrPointAz.length = 0;

    //второй коэффициент для акселерометра
    for (let i = 0; i < mapAX.quant; i++) {
        //конечная точка для прямой
        let xAx = (Math.log10(0.00005) - Math.log10(acsMain.x[i]) + (Math.log10(acsMain.time[i])) * m[1]) / (m[1]);

        let xAy = (Math.log10(0.00005) - Math.log10(acsMain.y[i]) + (Math.log10(acsMain.time[i])) * m[1]) / (m[1]);

        let xAz = (Math.log10(0.00005) - Math.log10(acsMain.z[i]) + (Math.log10(acsMain.time[i])) * m[1]) / (m[1]);

        bx = Math.log10(acsMain.x[i]) - m[1] * Math.log10(acsMain.time[i]);

        by = Math.log10(acsMain.y[i]) - m[1] * Math.log10(acsMain.time[i]);

        bz = Math.log10(acsMain.z[i]) - m[1] * Math.log10(acsMain.time[i]);

        //все параметры для этой точки
        var pointX = new objPoints([acsMain.time[i], acsMain.x[i], (Math.pow(10, xAx)), 0.00005]);

        var pointY = new objPoints([acsMain.time[i], acsMain.y[i], (Math.pow(10, xAy)), 0.00005]);

        var pointZ = new objPoints([acsMain.time[i], acsMain.z[i], (Math.pow(10, xAz)), 0.00005]);

        for (let y = 1; y < 100; y++) {
          let Xpos = acsMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
            let checkX = m[1] * Math.log10(Xpos) + bx;

            let checkY = m[1] * Math.log10(Xpos) + by;

            let checkZ = m[1] * Math.log10(Xpos) + bz;

            let numX = Math.pow(10, checkX);

            let numY = Math.pow(10, checkY);

            let numZ = Math.pow(10, checkZ);

            if (numX > acsMain.x[y]) {
              pointX.check += 1;
            }

            if (numY > acsMain.y[y]) {
              pointY.check += 1;
            }

            if (numZ > acsMain.z[y]) {
              pointZ.check += 1;
            }

          }

          if (pointX.check == 0 && !finalArrAx[1]) {
            finalArrAx.push(pointX);
          } else {
            arrPointAx.push(pointX);
          }

          if (pointY.check == 0 && !finalArrAy[1]) {
            finalArrAy.push(pointY);
          } else {
            arrPointAy.push(pointY);
          }

          if (pointZ.check == 0 && !finalArrAz[1]) {
            finalArrAz.push(pointZ);
            break;
          } else {
            arrPointAz.push(pointZ);
          }
        }

        arrPointAx.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        arrPointAy.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        arrPointAz.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        if (!finalArrAx[1]) {
          finalArrAx.push(arrPointAx[0]);
        }

        if (!finalArrAy[1]) {
          finalArrAy.push(arrPointAy[0]);
        }

        if (!finalArrAz[1]) {
          finalArrAz.push(arrPointAz[0]);
        }

        arrPointAx.length = 0;

        arrPointAy.length = 0;

        arrPointAz.length = 0;

    //третий коэффициент для акселерометра по X
    for (let i = mapAX.bias; i < mapAX.biasEnd; i++) {
        //конечная точка для прямой
        let xAx = (Math.log10(acsMain.x[i]));
        b = xAx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([acsMain.time[i], acsMain.x[i], 1, acsMain.x[i]]);
        for (let y = mapAX.bias+1; y < mapAX.biasEnd; y++) {
          let Xpos = acsMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > acsMain.x[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrAx[2]) {
            finalArrAx.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrAx[2]) {
          finalArrAx.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //третий коэффициент для акселерометра по Y
    for (let i = mapAY.bias; i < mapAY.biasEnd; i++) {
        //конечная точка для прямой
        let xAx = (Math.log10(acsMain.y[i]));
        b = xAx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([acsMain.time[i], acsMain.y[i], 1, acsMain.y[i]]);
        for (let y = mapAY.bias+1; y < mapAY.biasEnd; y++) {
          let Xpos = acsMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > acsMain.y[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrAy[2]) {
            finalArrAy.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrAy[2]) {
          finalArrAy.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //третий коэффициент для акселерометра по Z
    for (let i = mapAZ.bias; i < mapAZ.biasEnd; i++) {
        //конечная точка для прямой
        let xAx = (Math.log10(acsMain.z[i]));
        b = xAx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([acsMain.time[i], acsMain.z[i], 1, acsMain.z[i]]);
        for (let y = mapAZ.bias+1; y < mapAZ.biasEnd; y++) {
          let Xpos = acsMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > acsMain.z[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrAz[2]) {
            finalArrAz.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrAz[2]) {
          finalArrAz.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //четвертый коэффициент AX
    if (mapAX.walkEnd) {
      for (let i = mapAX.walk; i < mapAX.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(acsMain.x[i]) + (Math.log10(acsMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(acsMain.x[i]) - m[3] * Math.log10(acsMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([acsMain.time[i], acsMain.x[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapAX.walkEnd; y++) {
              let Xpos = acsMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > acsMain.x[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrAx[3]) {
                finalArrAx.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrAx[3]) {
              finalArrAx.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //четвертый коэффициент AY
    if (mapAY.walkEnd) {
      for (let i = mapAY.walk; i < mapAY.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(acsMain.y[i]) + (Math.log10(acsMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(acsMain.y[i]) - m[3] * Math.log10(acsMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([acsMain.time[i], acsMain.y[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapAY.walkEnd; y++) {
              let Xpos = acsMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > acsMain.y[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrAy[3]) {
                finalArrAy.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrAy[3]) {
              finalArrAy.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //четвертый коэффициент AZ
    if (mapAZ.walkEnd) {
      for (let i = mapAZ.walk; i < mapAZ.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(acsMain.z[i]) + (Math.log10(acsMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(acsMain.z[i]) - m[3] * Math.log10(acsMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([acsMain.time[i], acsMain.z[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapAZ.walkEnd; y++) {
              let Xpos = acsMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > acsMain.z[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrAz[3]) {
                finalArrAz.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrAy[3]) {
              finalArrAz.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент AX
    if (mapAX.rampEnd) {
      for (let i = mapAX.ramp; i < mapAX.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(acsMain.x[i]) + (Math.log10(acsMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(acsMain.x[i]) - m[4] * Math.log10(acsMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([acsMain.time[i], acsMain.x[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapAX.rampEnd; y++) {
              let Xpos = acsMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > acsMain.x[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrAx[4]) {
                finalArrAx.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrAx[4]) {
              finalArrAx.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент AY
    if (mapAY.rampEnd) {
      for (let i = mapAY.ramp; i < mapAY.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(acsMain.y[i]) + (Math.log10(acsMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(acsMain.y[i]) - m[4] * Math.log10(acsMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([acsMain.time[i], acsMain.y[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapAY.rampEnd; y++) {
              let Xpos = acsMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > acsMain.y[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrAy[4]) {
                finalArrAy.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrAy[4]) {
              finalArrAy.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент AZ
    if (mapAZ.rampEnd) {
      for (let i = mapAZ.ramp; i < mapAZ.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(acsMain.z[i]) + (Math.log10(acsMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(acsMain.z[i]) - m[4] * Math.log10(acsMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([acsMain.time[i], acsMain.z[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapAZ.rampEnd; y++) {
              let Xpos = acsMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(acsMain.x[0]) - m[z]*(Math.log10(acsMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > acsMain.z[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrAz[4]) {
                finalArrAz.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrAz[4]) {
              finalArrAz.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }
          console.log('test');

    /*
for(let i = acsMain.x.length - 1; i > 20000; i--){
  console.log(i);
  var ar = [acsMain. x, acs.y, acs.z];
  let m1 = +((Math.log10(tangentAcs.d.y) - Math.log10(acsMain.x[i]))/(Math.log10(tangentAcs.d.x) - Math.log10( acsMain.time[i]))).toFixed(5);
  arrProv.push(m1);
   //let m2 = +((Math.log10(tangentAcs.b.y) - Math.log10(acs.x[i]))/(Math.log10(tangentAcs.b.x) - Math.log10(acs.time[i]))).toFixed(1);
   //if( m1 == 0.5 ) alert("test");
   //else continue;
 }
 */


 console.log("Расчет акселерометра окончен");

    //первый коэффициент для магнитометр
    for (let i = 0; i < mapMX.quant; i++) {
        //конечная точка для прямой
        let xMx = (Math.log10(0.00005) - Math.log10(magMain.x[i]) + (Math.log10(magMain.time[i])) * m[0]) / (m[0]);
        let bx = Math.log10(magMain.x[i]) - m[0] * Math.log10(magMain.time[i]);

        let xMy = (Math.log10(0.00005) - Math.log10(magMain.y[i]) + (Math.log10(magMain.time[i])) * m[0]) / (m[0]);
        let by = Math.log10(magMain.y[i]) - m[0] * Math.log10(magMain.time[i]);

        let xMz = (Math.log10(0.00005) - Math.log10(magMain.z[i]) + (Math.log10(magMain.time[i])) * m[0]) / (m[0]);
        let bz = Math.log10(magMain.z[i]) - m[0] * Math.log10(magMain.time[i]);
        //все параметры для этой точки
        var pointMx = new objPoints([magMain.time[i], magMain.x[i], (Math.pow(10, xMx)), 0.00005]);

        var pointMy = new objPoints([magMain.time[i], magMain.y[i], (Math.pow(10, xMy)), 0.00005]);

        var pointMz = new objPoints([magMain.time[i], magMain.z[i], (Math.pow(10, xMz)), 0.00005]);

        for (let y = 1; y < (Math.pow(10, xMx)); y++) {
          let Xposx = magMain.time[y];

            //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
            let checkX = m[0] * Math.log10(Xposx) + bx;

            let checkY = m[0] * Math.log10(Xposx) + by;

            let checkZ = m[0] * Math.log10(Xposx) + bz;

            let numX = Math.pow(10, checkX);

            let numY = Math.pow(10, checkY);

            let numZ = Math.pow(10, checkZ);

            if (numX > magMain.x[y]) {
              pointMx.check += 1;
            }

            if (numY > magMain.y[y]) {
              pointMy.check += 1;
            }

            if (numZ > magMain.z[y]) {
              pointMz.check += 1;
            }

          }
          if (pointMx.check == 0 && !finalArrMx[0]) {
            finalArrMx.push(pointMx);
          } else {
            arrPointMx.push(pointMx);
          }

          if (pointMy.check == 0 && !finalArrMy[0]) {
            finalArrMy.push(pointMy);
          } else {
            arrPointMy.push(pointMy);
          }

          if (pointMz.check == 0 && !finalArrMz[0]) {
            finalArrMz.push(pointMz);
          } else {
            arrPointMz.push(pointMz);
          }
        }

        arrPointMx.length = 0;

        arrPointMy.length = 0;

        arrPointMz.length = 0;

    //второй коэффициент для акселерометра
    for (let i = 0; i < mapMX.quant; i++) {
        //конечная точка для прямой
        let xMx = (Math.log10(0.00005) - Math.log10(magMain.x[i]) + (Math.log10(magMain.time[i])) * m[1]) / (m[1]);

        let xMy = (Math.log10(0.00005) - Math.log10(magMain.y[i]) + (Math.log10(magMain.time[i])) * m[1]) / (m[1]);

        let xMz = (Math.log10(0.00005) - Math.log10(magMain.z[i]) + (Math.log10(magMain.time[i])) * m[1]) / (m[1]);

        bx = Math.log10(magMain.x[i]) - m[1] * Math.log10(magMain.time[i]);

        by = Math.log10(magMain.y[i]) - m[1] * Math.log10(magMain.time[i]);

        bz = Math.log10(magMain.z[i]) - m[1] * Math.log10(magMain.time[i]);

        //все параметры для этой точки
        var pointX = new objPoints([magMain.time[i], magMain.x[i], (Math.pow(10, xMx)), 0.00005]);

        var pointY = new objPoints([magMain.time[i], magMain.y[i], (Math.pow(10, xMy)), 0.00005]);

        var pointZ = new objPoints([magMain.time[i], magMain.z[i], (Math.pow(10, xMz)), 0.00005]);

        for (let y =  1; y < (Math.pow(10, xMz)); y++) {
          let Xpos = magMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
            let checkX = m[1] * Math.log10(Xpos) + bx;

            let checkY = m[1] * Math.log10(Xpos) + by;

            let checkZ = m[1] * Math.log10(Xpos) + bz;

            let numX = Math.pow(10, checkX);

            let numY = Math.pow(10, checkY);

            let numZ = Math.pow(10, checkZ);

            if (numX > magMain.x[y]) {
              pointX.check += 1;
            }

            if (numY > magMain.y[y]) {
              pointY.check += 1;
            }

            if (numZ < magMain.z[y]) {
              pointZ.check += 1;
            }

          }

          if (pointX.check == 0 && !finalArrMx[1]) {
            finalArrMx.push(pointX);
          } else {
            arrPointMx.push(pointX);
          }

          if (pointY.check == 0 && !finalArrMy[1]) {
            finalArrMy.push(pointY);
          } else {
            arrPointMy.push(pointY);
          }

          if (pointZ.check == 0 && !finalArrMz[1]) {
            finalArrMz.push(pointZ);
            break;
          } else {
            arrPointMz.push(pointZ);
          }
        }

        arrPointMx.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        arrPointMy.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        arrPointMz.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        if (!finalArrMx[1]) {
          finalArrMx.push(arrPointMx[0]);
        }

        if (!finalArrMy[1]) {
          finalArrMy.push(arrPointMy[0]);
        }

        if (!finalArrMz[1]) {
          finalArrMz.push(arrPointMz[0]);
        }

        arrPointMx.length = 0;

        arrPointMy.length = 0;

        arrPointMz.length = 0;

    //третий коэффициент для акселерометра по X
    for (let i = mapMX.bias; i < mapMX.biasEnd; i++) {
        //конечная точка для прямой
        let xMx = (Math.log10(magMain.x[i]));
        b = xMx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([magMain.time[i], magMain.x[i], 1, magMain.x[i]]);
        for (let y = mapMX.bias; y < mapMX.biasEnd; y++) {
          let Xpos = magMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > magMain.x[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrMx[2]) {
            finalArrMx.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrMx[2]) {
          finalArrMx.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //третий коэффициент для акселерометра по Y
    for (let i = mapMY.bias; i < mapMY.biasEnd; i++) {
        //конечная точка для прямой
        let xMx = (Math.log10(magMain.y[i]));
        b = xMx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([magMain.time[i], magMain.y[i], 1, magMain.y[i]]);
        for (let y = mapMY.bias; y < mapMY.biasEnd; y++) {
          let Xpos = magMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > magMain.y[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrMy[2]) {
            finalArrMy.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPointMx.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrMy[2]) {
          finalArrMy.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //третий коэффициент для акселерометра по Z
    for (let i = mapMZ.bias; i < mapMZ.biasEnd; i++) {
        //конечная точка для прямой
        let xMx = (Math.log10(magMain.z[i]));
        b = xMx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([magMain.time[i], magMain.z[i], 1, magMain.z[i]]);
        for (let y = mapMZ.bias; y < mapMZ.biasEnd; y++) {
          let Xpos = magMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > magMain.z[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrMz[2]) {
            finalArrMz.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrMz[2]) {
          finalArrMz.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //четвертый коэффициент Mx
    if (mapMX.walkEnd) {
      for (let i = mapMX.walk; i < mapMX.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(magMain.x[i]) + (Math.log10(magMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(magMain.x[i]) - m[3] * Math.log10(magMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([magMain.time[i], magMain.x[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapMX.walkEnd; y++) {
              let Xpos = magMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < magMain.x[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrMx[3]) {
                finalArrMx.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrMx[3]) {
              finalArrMx.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //четвертый коэффициент My
    if (mapMY.walkEnd) {
      for (let i = mapMY.walk; i < mapMY.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(magMain.y[i]) + (Math.log10(magMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(magMain.y[i]) - m[3] * Math.log10(magMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([magMain.time[i], magMain.y[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapMY.walkEnd; y++) {
              let Xpos = magMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < magMain.y[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrMy[3]) {
                finalArrMy.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrMy[3]) {
              finalArrMy.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //четвертый коэффициент Mz
    if (mapMZ.walkEnd) {
      for (let i = mapMZ.walk; i < mapMZ.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(magMain.z[i]) + (Math.log10(magMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(magMain.z[i]) - m[3] * Math.log10(magMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([magMain.time[i], magMain.z[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapMZ.walkEnd; y++) {
              let Xpos = magMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > magMain.z[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrMz[3]) {
                finalArrMz.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrMy[3]) {
              finalArrMz.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент Mx
    if (mapMX.rampEnd) {
      for (let i = mapMX.ramp; i < mapMX.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(magMain.x[i]) + (Math.log10(magMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(magMain.x[i]) - m[4] * Math.log10(magMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([magMain.time[i], magMain.x[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapMX.rampEnd; y++) {
              let Xpos = magMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < magMain.x[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrMx[4]) {
                finalArrMx.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrMx[4]) {
              finalArrMx.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент My
    if (mapMY.rampEnd) {
      for (let i = mapMY.ramp; i < mapMY.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(magMain.y[i]) + (Math.log10(magMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(magMain.y[i]) - m[4] * Math.log10(magMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([magMain.time[i], magMain.y[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapMY.rampEnd; y++) {
              let Xpos = magMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < magMain.y[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrMy[4]) {
                finalArrMy.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrMy[4]) {
              finalArrMy.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент Mz
    if (mapMZ.rampEnd) {
      for (let i = mapMZ.ramp; i < mapMZ.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(magMain.z[i]) + (Math.log10(magMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(magMain.z[i]) - m[4] * Math.log10(magMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([magMain.time[i], magMain.z[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapMZ.rampEnd; y++) {
              let Xpos = magMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(magMain.x[0]) - m[z]*(Math.log10(magMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < magMain.z[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrMz[4]) {
                finalArrMz.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrMz[4]) {
              finalArrMz.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }
          console.log("Расчет магнитометра окончен");

          /****************************GYROSCOPE*********************************/
    //первый коэффициент для магнитометр
    console.log(mapGX.quant);
    console.log(mapGX.biasEnd);
    console.log(mapGX.walkEnd);
    for (let i = 0; i < mapGX.quant; i++) {
        //конечная точка для прямой
        let xGx = (Math.log10(0.1) - Math.log10(giroMain.x[i]) + (Math.log10(giroMain.time[i])) * m[0]) / (m[0]);
        let bx = Math.log10(giroMain.x[i]) - m[0] * Math.log10(giroMain.time[i]);

        let xGy = (Math.log10(0.1) - Math.log10(giroMain.y[i]) + (Math.log10(giroMain.time[i])) * m[0]) / (m[0]);
        let by = Math.log10(giroMain.y[i]) - m[0] * Math.log10(giroMain.time[i]);

        let xGz = (Math.log10(0.1) - Math.log10(giroMain.z[i]) + (Math.log10(giroMain.time[i])) * m[0]) / (m[0]);
        let bz = Math.log10(giroMain.z[i]) - m[0] * Math.log10(giroMain.time[i]);
        //все параметры для этой точки
        var pointGx = new objPoints([giroMain.time[i], giroMain.x[i], (Math.pow(10, xGx)), 0.1]);

        var pointGy = new objPoints([giroMain.time[i], giroMain.y[i], (Math.pow(10, xGy)), 0.1]);

        var pointGz = new objPoints([giroMain.time[i], giroMain.z[i], (Math.pow(10, xGz)), 0.1]);

        for (let y = i + 1; y < (Math.pow(10, xGz)); y++) {
          let Xposx = giroMain.time[y];

            //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
            let checkX = m[0] * Math.log10(Xposx) + bx;

            let checkY = m[0] * Math.log10(Xposx) + by;

            let checkZ = m[0] * Math.log10(Xposx) + bz;

            let nuGx = Math.pow(10, checkX);

            let nuGy = Math.pow(10, checkY);

            let nuGz = Math.pow(10, checkZ);

            if (nuGx > giroMain.x[y]) {
              pointGx.check += 1;
            }

            if (nuGy > giroMain.y[y]) {
              pointGy.check += 1;
            }

            if (nuGz > giroMain.z[y]) {
              pointGz.check += 1;
            }

          }
          if (pointGx.check == 0 && !finalArrGx[0]) {
            finalArrGx.push(pointGx);
          } else {
            arrPointGx.push(pointGx);
          }

          if (pointGy.check == 0 && !finalArrGy[0]) {
            finalArrGy.push(pointGy);
          } else {
            arrPointGy.push(pointGy);
          }

          if (pointGz.check == 0 && !finalArrGz[0]) {
            finalArrGz.push(pointGz);
            break;
          } else {
            arrPointGz.push(pointGz);
          }
        }

        arrPointGx.length = 0;

        arrPointGy.length = 0;

        arrPointGz.length = 0;

    //второй коэффициент для акселерометра
    for (let i = 0; i < mapGX.quant; i++) {
        //конечная точка для прямой
        let xGx = (Math.log10(0.1) - Math.log10(giroMain.x[i]) + (Math.log10(giroMain.time[i])) * m[1]) / (m[1]);

        let xGy = (Math.log10(0.1) - Math.log10(giroMain.y[i]) + (Math.log10(giroMain.time[i])) * m[1]) / (m[1]);

        let xGz = (Math.log10(0.1) - Math.log10(giroMain.z[i]) + (Math.log10(giroMain.time[i])) * m[1]) / (m[1]);

        bx = Math.log10(giroMain.x[i]) - m[1] * Math.log10(giroMain.time[i]);

        by = Math.log10(giroMain.y[i]) - m[1] * Math.log10(giroMain.time[i]);

        bz = Math.log10(giroMain.z[i]) - m[1] * Math.log10(giroMain.time[i]);

        //все параметры для этой точки
        var pointX = new objPoints([giroMain.time[i], giroMain.x[i], (Math.pow(10, xGx)), 0.1]);

        var pointY = new objPoints([giroMain.time[i], giroMain.y[i], (Math.pow(10, xGy)), 0.1]);

        var pointZ = new objPoints([giroMain.time[i], giroMain.z[i], (Math.pow(10, xGz)), 0.1]);

        for (let y = i + 1; y < (Math.pow(10, xGz)); y++) {
          let Xpos = giroMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
            let checkX = m[1] * Math.log10(Xpos) + bx;

            let checkY = m[1] * Math.log10(Xpos) + by;

            let checkZ = m[1] * Math.log10(Xpos) + bz;

            let nuGx = Math.pow(10, checkX);

            let nuGy = Math.pow(10, checkY);

            let nuGz = Math.pow(10, checkZ);

            if (nuGx > giroMain.x[y]) {
              pointX.check += 1;
            }

            if (nuGy > giroMain.y[y]) {
              pointY.check += 1;
            }

            if (nuGz > giroMain.z[y]) {
              pointZ.check += 1;
            }

          }

          if (pointX.check == 0 && !finalArrGx[1]) {
            finalArrGx.push(pointX);
          } else {
            arrPointGx.push(pointX);
          }

          if (pointY.check == 0 && !finalArrGy[1]) {
            finalArrGy.push(pointY);
          } else {
            arrPointGy.push(pointY);
          }

          if (pointZ.check == 0 && !finalArrGz[1]) {
            finalArrGz.push(pointZ);
            break;
          } else {
            arrPointGz.push(pointZ);
          }
        }

        arrPointGx.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        arrPointGy.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        arrPointGz.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });

        if (!finalArrGx[1]) {
          finalArrGx.push(arrPointGx[0]);
        }

        if (!finalArrGy[1]) {
          finalArrGy.push(arrPointGy[0]);
        }

        if (!finalArrGz[1]) {
          finalArrGz.push(arrPointGz[0]);
        }

        arrPointGx.length = 0;

        arrPointGy.length = 0;

        arrPointGz.length = 0;

    //третий коэффициент для акселерометра по X
    for (let i = mapGX.quant; i < mapGX.bias; i++) {
        //конечная точка для прямой
        let xGx = (Math.log10(giroMain.x[i]));
        b = xGx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([giroMain.time[i], giroMain.x[i], 1, giroMain.x[i]]);
        for (let y = i + 1; y < mapGX.bias; y++) {
          let Xpos = giroMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > giroMain.x[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrGx[2]) {
            finalArrGx.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrGx[2]) {
          finalArrGx.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //третий коэффициент для акселерометра по Y
    for (let i = mapGY.quant; i < mapGY.bias; i++) {
        //конечная точка для прямой
        let xGx = (Math.log10(giroMain.y[i]));
        b = xGx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([giroMain.time[i], giroMain.y[i], 1, giroMain.y[i]]);
        for (let y = i + 1; y < mapGX.bias; y++) {
          let Xpos = giroMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > giroMain.y[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrGy[2]) {
            finalArrGy.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrGy[2]) {
          finalArrGy.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //третий коэффициент для акселерометра по Z
    for (let i = mapGZ.quant; i < mapGZ.bias; i++) {
        //конечная точка для прямой
        let xGx = (Math.log10(giroMain.z[i]));
        b = xGx;

        //for (var member in pointX) delete pointX[member];
        //все параметры для этой точки
        var pointX = new objPoints([giroMain.time[i], giroMain.z[i], 1, giroMain.z[i]]);
        for (let y = i + 1; y < mapGX.bias; y++) {
          let Xpos = giroMain.time[y];
            //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
            let check = m[2] * Math.log10(Xpos) + b;
            let num = Math.pow(10, check);
            if (num > giroMain.z[y]) {
              pointX.check += 1;
            }
          }
          if (pointX.check == 0 && !finalArrGz[2]) {
            finalArrGz.push(pointX);
            break;
          } else {
            arrPoint.push(pointX);
          }
        }
        arrPoint.sort(function(a, b) {
          return parseFloat(a.check) - parseFloat(b.check);
        });
        if (!finalArrGz[2]) {
          finalArrGz.push(arrPoint[0]);
        }

        arrPoint.length = 0;

    //четвертый коэффициент Gx
    if (mapGX.walkEnd) {
      for (let i = mapGX.walk; i < mapGX.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(giroMain.x[i]) + (Math.log10(giroMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(giroMain.x[i]) - m[3] * Math.log10(giroMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([giroMain.time[i], giroMain.x[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapGX.walkEnd; y++) {
              let Xpos = giroMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < giroMain.x[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrGx[3]) {
                finalArrGx.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrGx[3]) {
              finalArrGx.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //четвертый коэффициент Gy
    if (mapGY.walkEnd) {
      for (let i = mapGY.walk; i < mapGY.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(giroMain.y[i]) + (Math.log10(giroMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(giroMain.y[i]) - m[3] * Math.log10(giroMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([giroMain.time[i], giroMain.y[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapGY.walkEnd; y++) {
              let Xpos = giroMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < giroMain.y[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrGy[3]) {
                finalArrGy.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrGy[3]) {
              finalArrGy.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //четвертый коэффициент Gz
    if (mapGZ.walkEnd) {
      for (let i = mapGZ.walk; i < mapGZ.walkEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(giroMain.z[i]) + (Math.log10(giroMain.time[i])) * m[3]) / (m[3]);
            b = Math.log10(giroMain.z[i]) - m[3] * Math.log10(giroMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([giroMain.time[i], giroMain.z[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapGZ.walkEnd; y++) {
              let Xpos = giroMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
                let check = m[3] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num > giroMain.z[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrGz[3]) {
                finalArrGz.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrGy[3]) {
              finalArrGz.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент Gx
    if (mapGX.rampEnd) {
      for (let i = mapGX.ramp; i < mapGX.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(giroMain.x[i]) + (Math.log10(giroMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(giroMain.x[i]) - m[4] * Math.log10(giroMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([giroMain.time[i], giroMain.x[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapGX.rampEnd; y++) {
              let Xpos = giroMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < giroMain.x[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrGx[4]) {
                finalArrGx.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrGx[4]) {
              finalArrGx.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент Gy
    if (mapGY.rampEnd) {
      for (let i = mapGY.ramp; i < mapGY.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(giroMain.y[i]) + (Math.log10(giroMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(giroMain.y[i]) - m[4] * Math.log10(giroMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([giroMain.time[i], giroMain.y[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapGY.rampEnd; y++) {
              let Xpos = giroMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < giroMain.y[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrGy[4]) {
                finalArrGy.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrGy[4]) {
              finalArrGy.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

    //пятый коэффициент Gz
    if (mapGZ.rampEnd) {
      for (let i = mapGZ.ramp; i < mapGZ.rampEnd; i++) {
            //конечная точка для прямой
            let x1 = (Math.log10(0.00005) - Math.log10(giroMain.z[i]) + (Math.log10(giroMain.time[i])) * m[4]) / (m[4]);
            b = Math.log10(giroMain.z[i]) - m[4] * Math.log10(giroMain.time[i]);
            //все параметры для этой точки
            var point = new objPoints([giroMain.time[i], giroMain.z[i], (Math.pow(10, x1)), 0.00005]);
            for (let y = i + 1; y < mapGZ.rampEnd; y++) {
              let Xpos = giroMain.time[y];
                //let check = m[z]*Math.log10(Xpos) + Math.log10(giroMain.x[0]) - m[z]*(Math.log10(giroMain.time[0]));
                let check = m[4] * Math.log10(Xpos) + b;
                let num = Math.pow(10, check);
                if (num < giroMain.z[y]) {
                  point.check += 1;
                }
              }
              if (point.check == 0 && !finalArrGz[4]) {
                finalArrGz.push(point);
                break;
              } else {
                arrPoint.push(point);
              }
            }
            arrPoint.sort(function(a, b) {
              return parseFloat(a.check) - parseFloat(b.check);
            });
            if (!finalArrGz[4]) {
              finalArrGz.push(arrPoint[0]);
            }

            arrPoint.length = 0;
          }

          console.log("Расчет гироскопа окончен");

          var finalAllanObj = {
            finalArrAx: finalArrAx, 
            finalArrAy: finalArrAy,  
            finalArrAz: finalArrAz,
            finalArrMx: finalArrMx, 
            finalArrMy: finalArrMy,
            finalArrMz: finalArrMz,
            finalArrGx: finalArrGx,
            finalArrGy: finalArrGy,
            finalArrGz: finalArrGz
          }
          fs.writeFileSync(__dirname +'/views/serverResults.json',JSON.stringify({finalAllanObj}, null, 4));

          console.log("Расчет окончен");
        }


        setTimeout(function() {
    //console.log(JSON.parse(request)); 
    arr = request.body;
    console.log(arr); 
    plotRouting();
    console.log("Сообщение " + ic);
    ic++;
  }, 3000);

    //response.send("Message received.");
  });


//прием запросов с сервера: с пометкой "check" (значит, нужен будет сбор данных) и все остальные запросы для которых идет обычная обработка 
app.post('/', function(req, res){
  var obj = {};
  if(req.body.test == 'check'){
    check = req.body.number;
    if(portOpen)     portClosing();

    setTimeout(function() { dataSaving();
    }, 500);
    //clearTimeout(timer);
  }
  else if(req.body){
    console.log(req.body);
    COM = req.body.COM;
    Input = req.body.Input;
    console.log( portOpen);
    if(portOpen) {
      console.log("Port was closed")
      portClosing();
    }  
    console.log('serialport has started');
    setTimeout(function() { SerialPortStart(req.body.COM, req.body.Input); }, 1000);
  }
  res.send(req.body);
});


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