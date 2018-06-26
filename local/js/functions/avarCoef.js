//Графическое отображение заранее высчитанных наклонные, непосредственный подсчет коэффициентов по полученным данным

var coef = {};


function online(array){
  fs.readFile('json/allanVarianceClean.json', function(err, data) {
    if (err)
      throw err;
    arr = JSON.parse(data);
  });
  setTimeout(function() {
   finalArrAx = array.finalAllanObj.finalArrAx;
   finalArrAy = array.finalAllanObj.finalArrAy;
   finalArrAz = array.finalAllanObj.finalArrAz;

   finalArrMx = array.finalAllanObj.finalArrMx;
   finalArrMy = array.finalAllanObj.finalArrMy;
   finalArrMz = array.finalAllanObj.finalArrMz;

   finalArrGx = array.finalAllanObj.finalArrGx;
   finalArrGy = array.finalAllanObj.finalArrGy;
   finalArrGz = array.finalAllanObj.finalArrGz;

   for (let i = 0; i < 70000; i++) {

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
    giroMain.z.push(arr.allanVar.GY[i]);
    giroMain.time.push(arr.allanVar.Time[i]);



  }


}, 3000);
}

//Расчет коэффициентов для вариации Аллана по заданным точкам и занесение их непосредственно на сайт
function avarCoef() {
  if(tangentCheck){

        //Рассчет каждого из параметров для всех датчиков
        coef = {
          A: {
            x: {
              a: math.sqrt((math.pow((finalArrAx[0].y0), 2) * math.pow((finalArrAx[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrAx[1].y0), 2) * finalArrAx[1].x0),
              c: math.sqrt((math.pow((finalArrAx[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: math.sqrt((math.pow((finalArrAx[3].y0), 2) * 3) / finalArrAx[3].x0),
              e: math.sqrt(math.pow((finalArrAx[4].y0), 2) * 2 / math.pow(finalArrAx[4].x0, 2)),
            },
            y: {
              a: math.sqrt((math.pow((finalArrAy[0].y0), 2) * math.pow((finalArrAy[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrAy[1].y0), 2) * finalArrAy[1].x0),
              c: math.sqrt((math.pow((finalArrAy[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: math.sqrt((math.pow((finalArrAy[3].y0), 2) * 3) / finalArrAy[3].x0),
              e: math.sqrt(math.pow((finalArrAy[4].y0), 2) * 2 / math.pow(finalArrAy[4].x0, 2)),
            },
            z: {
              a: math.sqrt((math.pow((finalArrAz[0].y0), 2) * math.pow((finalArrAz[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrAz[1].y0), 2) * finalArrAz[1].x0),
              c: math.sqrt((math.pow((finalArrAz[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: math.sqrt((math.pow((finalArrAz[3].y0), 2) * 3) / finalArrAz[3].x0),
              e: math.sqrt(math.pow((finalArrAz[4].y0), 2) * 2 / math.pow(finalArrAz[4].x0, 2)),
            }
          },
          M: {
            x: {
              a: math.sqrt((math.pow((finalArrMx[0].y0), 2) * math.pow((finalArrMx[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrMx[1].y0), 2) * finalArrMx[1].x0),
              c: math.sqrt((math.pow((finalArrMx[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: math.sqrt((math.pow((finalArrMx[3].y0), 2) * 3) / finalArrMx[3].x0),
              e: 0,
            },
            y: {
              a: math.sqrt((math.pow((finalArrMy[0].y0), 2) * math.pow((finalArrMy[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrMy[1].y0), 2) * finalArrMy[1].x0),
              c: math.sqrt((math.pow((finalArrMy[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: math.sqrt((math.pow((finalArrMy[3].y0), 2) * 3) / finalArrMy[3].x0),
              e: 0,
            },
            z: {
              a: math.sqrt((math.pow((finalArrMz[0].y0), 2) * math.pow((finalArrMz[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrMz[1].y0), 2) * finalArrMz[1].x0),
              c: math.sqrt((math.pow((finalArrMz[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: math.sqrt((math.pow((finalArrMz[3].y0), 2) * 3) / finalArrMz[3].x0),
              e: 0,
            }
          },
          G: {
            x: {
              a: math.sqrt((math.pow((finalArrGx[0].y0), 2) * math.pow((finalArrGx[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrGx[1].y0), 2) * finalArrGx[1].x0),
              c: math.sqrt((math.pow((finalArrGx[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: 0,
              e: 0,
            },
            y: {
              a: math.sqrt((math.pow((finalArrGy[0].y0), 2) * math.pow((finalArrGy[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrGy[1].y0), 2) * finalArrGy[1].x0),
              c: math.sqrt((math.pow((finalArrGy[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: 0,
              e: 0,
            },
            z: {
              a: math.sqrt((math.pow((finalArrGz[0].y0), 2) * math.pow((finalArrGz[0].x0), 2)) / 3),
              b: math.sqrt(math.pow((finalArrGz[1].y0), 2) * finalArrGz[1].x0),
              c: math.sqrt((math.pow((finalArrGz[2].y0), 2) * Math.PI) / (2 * Math.log(2))),
              d: 0,
              e: 0,
            }
          }
        }
        var coefArr = [coef.A.x.a, coef.A.x.b, coef.A.x.c, coef.A.x.d, coef.A.x.e,
        coef.A.y.a, coef.A.y.b, coef.A.y.c, coef.A.y.d, coef.A.y.e,
        coef.A.z.a, coef.A.z.b, coef.A.z.c, coef.A.z.d, coef.A.z.e,
        coef.M.x.a, coef.M.x.b, coef.M.x.c, coef.M.x.d,
        coef.M.y.a, coef.M.y.b, coef.M.y.c, coef.M.y.d,
        coef.M.z.a, coef.M.z.b, coef.M.z.c, coef.M.z.d
        ]
        for(let y = 0; y < coefArr.length; y++){
          coefArr[y] = coefArr[y].toString();
          coefArr[y] = coefArr[y].split('');
          let count = 0;
          let num = 0;
          for(let i = 0; i < coefArr[y].length; i++){
            if(coefArr[y][i] == '0') count ++
              else if(coefArr[y][i] != '.' && coefArr[y][i] != '0'){
                if(num == 0) num = coefArr[y][i];
                else num += coefArr[y][i];
              }
              if(num.length == 2) break;
            }
            coefArr[y] = num.toString()+'*'+10+'-'+count;
          }





          $('.block11').css({
            "position": "initial",
            "opacity": "1"
          });
          $('.block12').css({
            "position": "initial",
            "opacity": "1"
          });
          $('.block13').css({
            "position": "initial",
            "opacity": "1"
          });
          $('.block14').css({
            "position": "initial",
            "opacity": "1"
          });
          $('.block15').css({
            "position": "initial",
            "opacity": "1"
          });
          $('.block16').css({
            "position": "initial",
            "opacity": "1"
          });

          console.log(coef);
          $('.deg4 .up').text("°");

          $('.deg .up').text("°/сек");
          $('.deg .buttom').text("√ч");

          $('.deg1 .up').text("°/сек");
          $('.deg1 .buttom').text("ч");

          $('.deg3 .up').text("°");
          $('.deg3 .buttom').text("√ч");

          $('.deg2 .up').text("°");
          $('.deg2 .buttom').text("ч");

          $('.coefc7 #coef1').text(coefArr[0]);
          $('.coefc7 #coef2').text(coefArr[1]);
          $('.coefc7 #coef3').text(coefArr[2]);
          $('.coefc7 #coef4').text(coefArr[3]);
          $('.coefc7 .deg .up').text("°/сек");
          $('.coefc7 .deg .buttom').text("√ч");
          $('.coefc7 #coef5').text(coefArr[4]);
          $('.coefc7 .deg1 .up').text("°/сек");
          $('.coefc7 .deg1 .buttom').text("√ч");

          $('.coefc8 #coef1').text(coefArr[5]);
          $('.coefc8 #coef2').text(coefArr[6]);
          $('.coefc8 #coef3').text(coefArr[7]);
          $('.coefc8 #coef4').text(coefArr[8]);
          $('.coefc8 .deg .up').text("°/сек");
          $('.coefc8 .deg .buttom').text("√ч");
          $('.coefc8 #coef5').text(coefArr[9]);
          $('.coefc8 .deg1 .up').text("°/сек");
          $('.coefc8 .deg1 .buttom').text("√ч");

          $('.coefc9 #coef1').text(coefArr[10]);
          $('.coefc9 #coef2').text(coefArr[11]);
          $('.coefc9 #coef3').text(coefArr[12]);
          $('.coefc9 #coef4').text(coefArr[13]);
          $('.coefc9 .deg .up').text("°/сек");
          $('.coefc9 .deg .buttom').text("√ч");
          $('.coefc9 #coef5').text(coefArr[14]);
          $('.coefc9 .deg1 .up').text("°/сек");
          $('.coefc9 .deg1 .buttom').text("√ч");

          $('.coefc4 #coef1').text(coefArr[15]);
          $('.coefc4 #coef2').text(coefArr[16]);
          $('.coefc4 #coef3').text(coefArr[17]);
          $('.coefc4 #coef4').text(coefArr[18]);
          $('.coefc4 .deg .up').text("°/сек");
          $('.coefc4 .deg .buttom').text("√ч");
          $('.coefc4 #coef5').text(coef.M.x.e);
          $('.coefc4 .deg1 .up').text("°/сек");
          $('.coefc4 .deg1 .buttom').text("√ч");

          $('.coefc5 #coef1').text(coefArr[19]);
          $('.coefc5 #coef2').text(coefArr[20]);
          $('.coefc5 #coef3').text(coefArr[21]);
          $('.coefc5 #coef4').text(coefArr[22]);
          $('.coefc5 #coef5').text(coef.M.y.e);

          $('.coefc6 #coef1').text(coefArr[23]);
          $('.coefc6 #coef2').text(coefArr[24]);
          $('.coefc6 #coef3').text(coefArr[25]);
          $('.coefc6 #coef4').text(coefArr[26]);
          $('.coefc6 #coef5').text(coef.M.z.e);

          $('.coefc1 #coef1').text(coef.G.x.a.toFixed(0));
          $('.coefc1 #coef2').text(coef.G.x.b.toFixed(0));
          $('.coefc1 #coef3').text(coef.G.x.c.toFixed(0));
          $('.coefc1 #coef4').text(coef.G.x.d.toFixed(0));
          $('.coefc1 #coef5').text(coef.G.x.e.toFixed(0));

          $('.coefc2 #coef1').text(coef.G.y.a.toFixed(0));
          $('.coefc2 #coef2').text(coef.G.y.b.toFixed(0));
          $('.coefc2 #coef3').text(coef.G.y.c.toFixed(0));
          $('.coefc2 #coef4').text(coef.G.y.d.toFixed(0));
          $('.coefc2 #coef5').text(coef.G.y.e.toFixed(0));

          $('.coefc3 #coef1').text(coef.G.z.a.toFixed(0));
          $('.coefc3 #coef2').text(coef.G.z.b.toFixed(0));
          $('.coefc3 #coef3').text(coef.G.z.c.toFixed(0));
          $('.coefc3 #coef4').text(coef.G.z.d.toFixed(0));
          $('.coefc3 #coef5').text(coef.G.z.e.toFixed(0));
        }
      }

//Гистограммы для вариации Аллана
function avarGystogramms() {
  if(tangentCheck){
    var dataBarAXa = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.A.x.a, coef.A.y.a, coef.A.z.a],
      width: [0.5, 0.5, 0.5],
      type: 'bar',
      name: 'OX'
    }];
    layAXa = {
      title: 'Коэффициенты шума квантования',
      showlegend: false
    }
    Plotly.newPlot('barChartAa', dataBarAXa, layAXa);
    var dataBarAXb = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.A.x.b * math.sqrt(3600), coef.A.y.b * math.sqrt(3600), coef.A.z.b * math.sqrt(3600)],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layAXb = {
      title: 'Коэффициенты случайного блуждания угла',
    };
    Plotly.newPlot('barChartAb', dataBarAXb, layAXb);

    var dataBarAXc = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.A.x.c * 3600, coef.A.y.c * 3600, coef.A.z.c * 3600],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layAXс = {
      title: 'Коэффициенты нестабильности нуля ',
    };
    Plotly.newPlot('barChartAc', dataBarAXc, layAXс);

    var dataBarAXd = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.A.x.d * 60 * math.sqrt(3600), coef.A.y.d * 60 * math.sqrt(3600), coef.A.z.d * 60 * math.sqrt(3600)],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];

    layAXd = {
      title: 'Коэффициенты случайного блуждания угла ',
    };

    Plotly.newPlot('barChartAd', dataBarAXd, layAXd);

    var dataBarAXe = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.A.x.e * 60 * 3600, coef.A.y.e * 60 * 3600, coef.A.z.e * 60 * 3600],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layAXe = {
      title: 'Коэффициенты мультипликативной погрешности ',
    };

    Plotly.newPlot('barChartAe', dataBarAXe, layAXe);

    /* MAGNITOMETR */

    var dataBarMXa = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.M.x.a, coef.M.y.a, coef.M.z.a],
      width: [0.5, 0.5, 0.5],
      type: 'bar',
      name: 'OX'
    }];
    layMXa = {
      title: 'Коэффициенты шума квантования',
      showlegend: false
    }
    Plotly.newPlot('barChartMa', dataBarMXa, layMXa);

    var dataBarMXb = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.M.x.b * math.sqrt(3600), coef.M.y.b * math.sqrt(3600), coef.M.z.b * math.sqrt(3600)],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layMXb = {
      title: 'Коэффициенты случайного блуждания угла',
    };
    Plotly.newPlot('barChartMb', dataBarMXb, layMXb);

    var dataBarMXc = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.M.x.c * 3600, coef.M.y.c * 3600, coef.M.z.c * 3600],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layMXс = {
      title: 'Коэффициенты нестабильности нуля ',
    };
    Plotly.newPlot('barChartMc', dataBarMXc, layMXс);

    var dataBarMXd = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.M.x.d * 60 * math.sqrt(3600), coef.M.y.d * 60 * math.sqrt(3600), coef.M.z.d * 60 * math.sqrt(3600)],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];

    layMXd = {
      title: 'Коэффициенты случайного блуждания угла ',
    };

    Plotly.newPlot('barChartMd', dataBarMXd, layMXd);

    var dataBarMXe = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.M.x.e * 60 * 3600, coef.M.y.e * 60 * 3600, coef.M.z.e * 60 * 3600],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layMXe = {
      title: 'Коэффициенты мультипликативной погрешности ',
    };

    Plotly.newPlot('barChartMe', dataBarMXe, layMXe);

    /* GIROSKOP */

    var dataBarGXa = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.G.x.a, coef.G.y.a, coef.G.z.a],
      width: [0.5, 0.5, 0.5],
      type: 'bar',
      name: 'OX'
    }];
    layGXa = {
      title: 'Коэффициенты шума квантования',
      showlegend: false
    }
    Plotly.newPlot('barChartGa', dataBarGXa, layGXa);

    var dataBarGXb = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.G.x.b * math.sqrt(3600), coef.G.y.b * math.sqrt(3600), coef.G.z.b * math.sqrt(3600)],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layGXb = {
      title: 'Коэффициенты случайного блуждания угла',
    };
    Plotly.newPlot('barChartGb', dataBarGXb, layGXb);

    var dataBarGXc = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.G.x.c * 3600, coef.G.y.c * 3600, coef.G.z.c * 3600],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layGXс = {
      title: 'Коэффициенты нестабильности нуля ',
    };
    Plotly.newPlot('barChartGc', dataBarGXc, layGXс);

    var dataBarGXd = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.G.x.d * 60 * math.sqrt(3600), coef.G.y.d * 60 * math.sqrt(3600), coef.G.z.d * 60 * math.sqrt(3600)],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];

    layGXd = {
      title: 'Коэффициенты случайного блуждания угла ',
    };

    Plotly.newPlot('barChartGd', dataBarGXd, layGXd);

    var dataBarGXe = [{
      x: ['X', 'Y', 'Z'],
      y: [coef.G.x.e * 60 * 3600, coef.G.y.e * 60 * 3600, coef.G.z.e * 60 * 3600],
      width: [0.5, 0.5, 0.5],
      type: 'bar'
    }];
    layGXe = {
      title: 'Коэффициенты мультипликативной погрешности ',
    };

    Plotly.newPlot('barChartGe', dataBarGXe, layGXe);
  }
}

//занесение всех данных, высчитанных ранее, на сайт в виде графиков и наклонных к ним
function plotInserting() {
  if(tangentCheck){

    var traceAX = {
      y: acsMain.x,
      x: acsMain.time,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'rgb(215, 47, 0)'
      },
      name: 'OX'
    };

    var dataAX = [traceAX];

    if (!jQuery.isEmptyObject(finalArrAx[3])) {} else {
      let point = new objPoints([0, 0, 0, 0]);
      finalArrAx.push(point);
      finalArrAx[3].x0 = acsMain.x[0]
      finalArrAx[3].x1 = acsMain.x[0]
      finalArrAx[3].y0 = acsMain.x[0]
      finalArrAx[3].y1 = acsMain.x[0]
    }

    if (!jQuery.isEmptyObject(finalArrAx[2])) {} else {
      let point = new objPoints([0, 0, 0, 0]);
      finalArrAx.push(point);
      finalArrAx[2].x0 = acsMain.x[0]
      finalArrAx[2].x1 = acsMain.x[0]
      finalArrAx[2].y0 = acsMain.x[0]
      finalArrAx[2].y1 = acsMain.x[0]
    }

    if (!jQuery.isEmptyObject(finalArrAx[4])) {} else {
      let point = new objPoints([0, 0, 0, 0]);
      finalArrAx.push(point);
      finalArrAx[4].x0 = acsMain.x[0]
      finalArrAx[4].x1 = acsMain.x[0]
      finalArrAx[4].y0 = acsMain.x[0]
      finalArrAx[4].y1 = acsMain.x[0]
    }

    layoutAX = {
      autosize: true,
      dragmode: 'pan',
      shapes: [{
        line: {
          color: 'red',
          width: 2
        },
        opacity: 1,
        type: 'line',
        x0: finalArrAx[0].x0,
        x1: finalArrAx[0].x1,
        y0: finalArrAx[0].y0,
        y1: finalArrAx[0].y1
      }, {
        line: {
          color: 'orange',
          width: 2
        },
        type: 'line',
        x0: finalArrAx[1].x0,
        x1: finalArrAx[1].x1,
        y0: finalArrAx[1].y0,
        y1: finalArrAx[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrAx[2].x0,
          x1: finalArrAx[2].x1,
          y0: finalArrAx[2].y0,
          y1: finalArrAx[2].y1
        }, {
          line: {
            color: 'lawngreen',
            width: 2
          },
          type: 'line',
          x0: finalArrAx[3].x0,
          x1: finalArrAx[3].x1,
          y0: finalArrAx[3].y0,
          y1: finalArrAx[3].y1
        }, {
          line: {
            color: 'blueviolet',
            width: 2
          },
          type: 'line',
          x0: finalArrAx[4].x0,
          x1: finalArrAx[4].x1,
          y0: finalArrAx[4].y0,
          y1: finalArrAx[4].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };
      Plotly.newPlot('myDivAX', dataAX, layoutAX);

      /****************************Y**********************************/

      var traceAY = {
        y: acsMain.y,
        x: acsMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'green'
        },
        name: 'OY'
      };

      var dataAY = [traceAY];

      if (!jQuery.isEmptyObject(finalArrAy[3])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrAy.push(point);
        finalArrAy[3].x0 = acsMain.y[0]
        finalArrAy[3].x1 = acsMain.y[0]
        finalArrAy[3].y0 = acsMain.y[0]
        finalArrAy[3].y1 = acsMain.y[0]
      }

      if (!jQuery.isEmptyObject(finalArrAy[2])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrAy.push(point);
        finalArrAy[2].x0 = acsMain.y[0]
        finalArrAy[2].x1 = acsMain.y[0]
        finalArrAy[2].y0 = acsMain.y[0]
        finalArrAy[2].y1 = acsMain.y[0]
      }

      if (!jQuery.isEmptyObject(finalArrAy[4])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrAy.push(point);
        finalArrAy[4].x0 = acsMain.y[0]
        finalArrAy[4].x1 = acsMain.y[0]
        finalArrAy[4].y0 = acsMain.y[0]
        finalArrAy[4].y1 = acsMain.y[0]
      }

      layoutAY = {
        autosize: true,
        dragmode: 'pan',
        shapes: [{
          line: {
            color: 'red',
            width: 2
          },
          opacity: 1,
          type: 'line',
          x0: finalArrAy[0].x0,
          x1: finalArrAy[0].x1,
          y0: finalArrAy[0].y0,
          y1: finalArrAy[0].y1
        }, {
          line: {
            color: 'orange',
            width: 2
          },
          type: 'line',
          x0: finalArrAy[1].x0,
          x1: finalArrAy[1].x1,
          y0: finalArrAy[1].y0,
          y1: finalArrAy[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrAy[2].x0,
          x1: finalArrAy[2].x1,
          y0: finalArrAy[2].y0,
          y1: finalArrAy[2].y1
        }, {
          line: {
            color: 'lawngreen',
            width: 2
          },
          type: 'line',
          x0: finalArrAy[3].x0,
          x1: finalArrAy[3].x1,
          y0: finalArrAy[3].y0,
          y1: finalArrAy[3].y1
        }, {
          line: {
            color: 'blueviolet',
            width: 2
          },
          type: 'line',
          x0: finalArrAy[4].x0,
          x1: finalArrAy[4].x1,
          y0: finalArrAy[4].y0,
          y1: finalArrAy[4].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };

      Plotly.newPlot('myDivAY', dataAY, layoutAY);

      /****************************Z**********************************/

      if (!jQuery.isEmptyObject(finalArrAz[3])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrAz.push(point);
        finalArrAz[3].x0 = acsMain.z[0]
        finalArrAz[3].x1 = acsMain.z[0]
        finalArrAz[3].y0 = acsMain.z[0]
        finalArrAz[3].y1 = acsMain.z[0]
      }

      if (!jQuery.isEmptyObject(finalArrAz[2])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrAz.push(point);
        finalArrAz[2].x0 = acsMain.z[0]
        finalArrAz[2].x1 = acsMain.z[0]
        finalArrAz[2].y0 = acsMain.z[0]
        finalArrAz[2].y1 = acsMain.z[0]
      }

      if (!jQuery.isEmptyObject(finalArrAz[4])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrAz.push(point);
        finalArrAz[4].x0 = acsMain.z[0]
        finalArrAz[4].x1 = acsMain.z[0]
        finalArrAz[4].y0 = acsMain.z[0]
        finalArrAz[4].y1 = acsMain.z[0]
      }

      var traceAZ = {
        y: acsMain.z,
        x: acsMain.time,
        type: 'scatter',
        mode: 'lines',
        name: 'OZ'
      };

      var dataAZ = [traceAZ];

      layoutAZ = {
        autosize: true,
        dragmode: 'pan',
        shapes: [{
          line: {
            color: 'red',
            width: 2
          },
          opacity: 1,
          type: 'line',
          x0: finalArrAz[0].x0,
          x1: finalArrAz[0].x1,
          y0: finalArrAz[0].y0,
          y1: finalArrAz[0].y1
        }, {
          line: {
            color: 'orange',
            width: 2
          },
          type: 'line',
          x0: finalArrAz[1].x0,
          x1: finalArrAz[1].x1,
          y0: finalArrAz[1].y0,
          y1: finalArrAz[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrAz[2].x0,
          x1: finalArrAz[2].x1,
          y0: finalArrAz[2].y0,
          y1: finalArrAz[2].y1
        }, {
          line: {
            color: 'lawngreen',
            width: 2
          },
          type: 'line',
          x0: finalArrAz[3].x0,
          x1: finalArrAz[3].x1,
          y0: finalArrAz[3].y0,
          y1: finalArrAz[3].y1
        }, {
          line: {
            color: 'blueviolet',
            width: 2
          },
          type: 'line',
          x0: finalArrAz[4].x0,
          x1: finalArrAz[4].x1,
          y0: finalArrAz[4].y0,
          y1: finalArrAz[4].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };
      Plotly.newPlot('myDivAZ', dataAZ, layoutAZ);

      /* Графики вариации Аллана для Гироскопа  */

      /****************************X**********************************/

      var traceGX = {
        y: giroMain.x,
        x: giroMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'blue'
        },
        name: 'OX'
      };

      var dataGX = [traceGX];

      if (!jQuery.isEmptyObject(finalArrGx[3])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGx.push(point);
        finalArrGx[3].x0 = giroMain.x[0]
        finalArrGx[3].x1 = giroMain.x[0]
        finalArrGx[3].y0 = giroMain.x[0]
        finalArrGx[3].y1 = giroMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrGx[2])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGx.push(point);
        finalArrGx[2].x0 = giroMain.x[0]
        finalArrGx[2].x1 = giroMain.x[0]
        finalArrGx[2].y0 = giroMain.x[0]
        finalArrGx[2].y1 = giroMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrGx[4])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGx.push(point);
        finalArrGx[4].x0 = giroMain.x[0]
        finalArrGx[4].x1 = giroMain.x[0]
        finalArrGx[4].y0 = giroMain.x[0]
        finalArrGx[4].y1 = giroMain.x[0]
      }

      layoutGX = {
        autosize: true,
        dragmode: 'pan',
        shapes: [{
          line: {
            color: 'red',
            width: 2
          },
          opacity: 1,
          type: 'line',
          x0: finalArrGx[0].x0,
          x1: finalArrGx[0].x1,
          y0: finalArrGx[0].y0,
          y1: finalArrGx[0].y1
        }, {
          line: {
            color: 'orange',
            width: 2
          },
          type: 'line',
          x0: finalArrGx[1].x0,
          x1: finalArrGx[1].x1,
          y0: finalArrGx[1].y0,
          y1: finalArrGx[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrGx[2].x0,
          x1: finalArrGx[2].x1,
          y0: finalArrGx[2].y0,
          y1: finalArrGx[2].y1
        } ],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };

      Plotly.newPlot('myDivGX', dataGX, layoutGX);

      /****************************Y**********************************/

      var traceGY = {
        y: giroMain.y,
        x: giroMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'green'
        },
        name: 'OY'

      };

      var dataGY = [traceGY];

      if (!jQuery.isEmptyObject(finalArrGy[3])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGy.push(point);
        finalArrGy[3].x0 = giroMain.x[0]
        finalArrGy[3].x1 = giroMain.x[0]
        finalArrGy[3].y0 = giroMain.x[0]
        finalArrGy[3].y1 = giroMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrGy[2])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGy.push(point);
        finalArrGy[2].x0 = giroMain.x[0]
        finalArrGy[2].x1 = giroMain.x[0]
        finalArrGy[2].y0 = giroMain.x[0]
        finalArrGy[2].y1 = giroMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrGy[4])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGy.push(point);
        finalArrGy[4].x0 = giroMain.x[0]
        finalArrGy[4].x1 = giroMain.x[0]
        finalArrGy[4].y0 = giroMain.x[0]
        finalArrGy[4].y1 = giroMain.x[0]
      }

      layoutGY = {
        autosize: true,
        dragmode: 'pan',
        shapes: [{
          line: {
            color: 'red',
            width: 2
          },
          opacity: 1,
          type: 'line',
          x0: finalArrGy[0].x0,
          x1: finalArrGy[0].x1,
          y0: finalArrGy[0].y0,
          y1: finalArrGy[0].y1
        }, {
          line: {
            color: 'orange',
            width: 2
          },
          type: 'line',
          x0: finalArrGy[1].x0,
          x1: finalArrGy[1].x1,
          y0: finalArrGy[1].y0,
          y1: finalArrGy[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrGy[2].x0,
          x1: finalArrGy[2].x1,
          y0: finalArrGy[2].y0,
          y1: finalArrGy[2].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };

      Plotly.newPlot('myDivGY', dataGY, layoutGY);

      /****************************Z**********************************/



      var traceGZ = {
        y: giroMain.x,
        x: giroMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'red'
        },
        name: 'OX'
      };

      var dataGZ = [traceGZ];

      if (!jQuery.isEmptyObject(finalArrGx[3])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGx.push(point);
        finalArrGx[3].x0 = giroMain.x[0]
        finalArrGx[3].x1 = giroMain.x[0]
        finalArrGx[3].y0 = giroMain.x[0]
        finalArrGx[3].y1 = giroMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrGx[2])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGx.push(point);
        finalArrGx[2].x0 = giroMain.x[0]
        finalArrGx[2].x1 = giroMain.x[0]
        finalArrGx[2].y0 = giroMain.x[0]
        finalArrGx[2].y1 = giroMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrGx[4])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrGx.push(point);
        finalArrGx[4].x0 = giroMain.x[0]
        finalArrGx[4].x1 = giroMain.x[0]
        finalArrGx[4].y0 = giroMain.x[0]
        finalArrGx[4].y1 = giroMain.x[0]
      }

      layoutGZ = {
        autosize: true,
        dragmode: 'pan',
        shapes: [{
          line: {
            color: 'red',
            width: 2
          },
          opacity: 1,
          type: 'line',
          x0: finalArrGx[0].x0,
          x1: finalArrGx[0].x1,
          y0: finalArrGx[0].y0,
          y1: finalArrGx[0].y1
        }, {
          line: {
            color: 'orange',
            width: 2
          },
          type: 'line',
          x0: finalArrGx[1].x0,
          x1: finalArrGx[1].x1,
          y0: finalArrGx[1].y0,
          y1: finalArrGx[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrGx[2].x0,
          x1: finalArrGx[2].x1,
          y0: finalArrGx[2].y0,
          y1: finalArrGx[2].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };

      Plotly.newPlot('myDivGZ', dataGZ, layoutGZ);



      var traceGZ = {
        y: giroMain.z,
        x: giroMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {color: 'red'},
        name:'OZ'
      };

      var dataGZ = [  traceGZ];

      if(!jQuery.isEmptyObject(finalArrGz[3])) {}
        else {
          let point = new objPoints([ 0, 0, 0, 0]);
          finalArrGz.push(point);
          finalArrGz[3].x0 = giroMain.x[0]
          finalArrGz[3].x1 = giroMain.x[0]
          finalArrGz[3].y0 = giroMain.x[0]
          finalArrGz[3].y1 = giroMain.x[0]
        }

        if(!jQuery.isEmptyObject(finalArrGz[2])) {}
          else {
           let point = new objPoints([ 0, 0, 0, 0]);
           finalArrGz.push(point);
           finalArrGz[2].x0 = giroMain.x[0]
           finalArrGz[2].x1 = giroMain.x[0]
           finalArrGz[2].y0 = giroMain.x[0]
           finalArrGz[2].y1 = giroMain.x[0]
         }

         if(!jQuery.isEmptyObject(finalArrGz[4])) {}
          else {
           let point = new objPoints([ 0, 0, 0, 0]);
           finalArrGz.push(point);
           finalArrGz[4].x0 = giroMain.x[0]
           finalArrGz[4].x1 = giroMain.x[0]
           finalArrGz[4].y0 = giroMain.x[0]
           finalArrGz[4].y1 = giroMain.x[0]
         }

         layoutGZ = {
          autosize: true, 
          dragmode: 'pan', 
          shapes: [
          {
            line: {
              color: 'red', 
              width: 2
            }, 
            opacity: 1, 
            type: 'line', 
            x0: finalArrGz[0].x0, 
            x1: finalArrGz[0].x1, 
            y0: finalArrGz[0].y0, 
            y1: finalArrGz[0].y1
          }, 
          {
            line: {
              color: 'orange', 
              width: 2
            }, 
            type: 'line', 
            x0: finalArrGz[1].x0, 
            x1: finalArrGz[1].x1, 
            y0: finalArrGz[1].y0, 
            y1: finalArrGz[1].y1
          }, 
  //коэффицтент D
  {
    line: {
      color: 'deepskyblue', 
      width: 2
    }, 
    type: 'line', 
    x0: finalArrGz[2].x0, 
    x1: finalArrGz[2].x1, 
    y0: finalArrGz[2].y0, 
    y1: finalArrGz[2].y1
  }
  ], 
  xaxis: {
    autorange: true, 
    type: 'log'
  }, 
  yaxis: {
    autorange: true, 
    type: 'log'
  },
  showlegend: true, 
  title: 'Ось ОX', 

};

Plotly.newPlot('myDivGZ', dataGZ, layoutGZ);



/* Графики вариации Аллана для Магнитометра  */

/****************************X**********************************/

var traceMX = {
  y: magMain.x,
  x: magMain.time,
  type: 'scatter',
  mode: 'lines',
  line: {
    color: 'blue'
  },
  name: 'OX'
};

var dataMX = [traceMX];

if (!jQuery.isEmptyObject(finalArrMx[3])) {} else {
  let point = new objPoints([0, 0, 0, 0]);
  finalArrMx.push(point);
  finalArrMx[3].x0 = magMain.x[0]
  finalArrMx[3].x1 = magMain.x[0]
  finalArrMx[3].y0 = magMain.x[0]
  finalArrMx[3].y1 = magMain.x[0]
}

if (!jQuery.isEmptyObject(finalArrMx[2])) {} else {
  let point = new objPoints([0, 0, 0, 0]);
  finalArrMx.push(point);
  finalArrMx[2].x0 = magMain.x[0]
  finalArrMx[2].x1 = magMain.x[0]
  finalArrMx[2].y0 = magMain.x[0]
  finalArrMx[2].y1 = magMain.x[0]
}

if (!jQuery.isEmptyObject(finalArrMx[4])) {} else {
  let point = new objPoints([0, 0, 0, 0]);
  finalArrMx.push(point);
  finalArrMx[4].x0 = magMain.x[0]
  finalArrMx[4].x1 = magMain.x[0]
  finalArrMx[4].y0 = magMain.x[0]
  finalArrMx[4].y1 = magMain.x[0]
}

layoutMX = {
  autosize: true,
  dragmode: 'pan',
  shapes: [{
    line: {
      color: 'red',
      width: 2
    },
    opacity: 1,
    type: 'line',
    x0: finalArrMx[0].x0,
    x1: finalArrMx[0].x1,
    y0: finalArrMx[0].y0,
    y1: finalArrMx[0].y1
  }, {
    line: {
      color: 'orange',
      width: 2
    },
    type: 'line',
    x0: finalArrMx[1].x0,
    x1: finalArrMx[1].x1,
    y0: finalArrMx[1].y0,
    y1: finalArrMx[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrMx[2].x0,
          x1: finalArrMx[2].x1,
          y0: finalArrMx[2].y0,
          y1: finalArrMx[2].y1
        }, {
          line: {
            color: 'lawngreen',
            width: 2
          },
          type: 'line',
          x0: finalArrMx[3].x0,
          x1: finalArrMx[3].x1,
          y0: finalArrMx[3].y0,
          y1: finalArrMx[3].y1
        }, {
          line: {
            color: 'blueviolet',
            width: 2
          },
          type: 'line',
          x0: finalArrMx[4].x0,
          x1: finalArrMx[4].x1,
          y0: finalArrMx[4].y0,
          y1: finalArrMx[4].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };
      Plotly.newPlot('myDivMX', dataMX, layoutMX);

      /****************************Y**********************************/

      var traceMY = {
        y: magMain.y,
        x: magMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'green'
        },
        name: 'OY'
      };

      var dataMY = [traceMY];

      if (!jQuery.isEmptyObject(finalArrMy[3])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrMy.push(point);
        finalArrMy[3].x0 = magMain.x[0]
        finalArrMy[3].x1 = magMain.x[0]
        finalArrMy[3].y0 = magMain.x[0]
        finalArrMy[3].y1 = magMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrMy[2])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrMy.push(point);
        finalArrMy[2].x0 = magMain.x[0]
        finalArrMy[2].x1 = magMain.x[0]
        finalArrMy[2].y0 = magMain.x[0]
        finalArrMy[2].y1 = magMain.x[0]
      }

      if (!jQuery.isEmptyObject(finalArrMy[4])) {} else {
        let point = new objPoints([0, 0, 0, 0]);
        finalArrMy.push(point);
        finalArrMy[4].x0 = magMain.x[0]
        finalArrMy[4].x1 = magMain.x[0]
        finalArrMy[4].y0 = magMain.x[0]
        finalArrMy[4].y1 = magMain.x[0]
      }

      layoutMY = {
        autosize: true,
        dragmode: 'pan',
        shapes: [{
          line: {
            color: 'red',
            width: 2
          },
          opacity: 1,
          type: 'line',
          x0: finalArrMy[0].x0,
          x1: finalArrMy[0].x1,
          y0: finalArrMy[0].y0,
          y1: finalArrMy[0].y1
        }, {
          line: {
            color: 'orange',
            width: 2
          },
          type: 'line',
          x0: finalArrMy[1].x0,
          x1: finalArrMy[1].x1,
          y0: finalArrMy[1].y0,
          y1: finalArrMy[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrMy[2].x0,
          x1: finalArrMy[2].x1,
          y0: finalArrMy[2].y0,
          y1: finalArrMy[2].y1
        }, {
          line: {
            color: 'lawngreen',
            width: 2
          },
          type: 'line',
          x0: finalArrMy[3].x0,
          x1: finalArrMy[3].x1,
          y0: finalArrMy[3].y0,
          y1: finalArrMy[3].y1
        }, {
          line: {
            color: 'blueviolet',
            width: 2
          },
          type: 'line',
          x0: finalArrMy[4].x0,
          x1: finalArrMy[4].x1,
          y0: finalArrMy[4].y0,
          y1: finalArrMy[4].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };

      Plotly.newPlot('myDivMY', dataMY, layoutMY);

      /****************************Z**********************************/

    //test();

    var traceMZ = {
      y: magMain.z,
      x: magMain.time,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'red'
      },
      name: 'OZ'
    };

    var dataMZ = [traceMZ];

    if (!jQuery.isEmptyObject(finalArrMz[3])) {} else {
      let point = new objPoints([0, 0, 0, 0]);
      finalArrMz.push(point);
      finalArrMz[3].x0 = magMain.x[0]
      finalArrMz[3].x1 = magMain.x[0]
      finalArrMz[3].y0 = magMain.x[0]
      finalArrMz[3].y1 = magMain.x[0]
    }

    if (!jQuery.isEmptyObject(finalArrMz[2])) {} else {
      let point = new objPoints([0, 0, 0, 0]);
      finalArrMz.push(point);
      finalArrMz[2].x0 = magMain.x[0]
      finalArrMz[2].x1 = magMain.x[0]
      finalArrMz[2].y0 = magMain.x[0]
      finalArrMz[2].y1 = magMain.x[0]
    }

    if (!jQuery.isEmptyObject(finalArrMz[4])) {} else {
      let point = new objPoints([0, 0, 0, 0]);
      finalArrMz.push(point);
      finalArrMz[4].x0 = magMain.x[0]
      finalArrMz[4].x1 = magMain.x[0]
      finalArrMz[4].y0 = magMain.x[0]
      finalArrMz[4].y1 = magMain.x[0]
    }

    layoutMZ = {
      autosize: true,
      dragmode: 'pan',
      shapes: [{
        line: {
          color: 'red',
          width: 2
        },
        opacity: 1,
        type: 'line',
        x0: finalArrMz[0].x0,
        x1: finalArrMz[0].x1,
        y0: finalArrMz[0].y0,
        y1: finalArrMz[0].y1
      }, {
        line: {
          color: 'orange',
          width: 2
        },
        type: 'line',
        x0: finalArrMz[1].x0,
        x1: finalArrMz[1].x1,
        y0: finalArrMz[1].y0,
        y1: finalArrMz[1].y1
        }, //коэффицтент D
        {
          line: {
            color: 'deepskyblue',
            width: 2
          },
          type: 'line',
          x0: finalArrMz[2].x0,
          x1: finalArrMz[2].x1,
          y0: finalArrMz[2].y0,
          y1: finalArrMz[2].y1
        }, {
          line: {
            color: 'lawngreen',
            width: 2
          },
          type: 'line',
          x0: finalArrMz[3].x0,
          x1: finalArrMz[3].x1,
          y0: finalArrMz[3].y0,
          y1: finalArrMz[3].y1
        }, {
          line: {
            color: 'blueviolet',
            width: 2
          },
          type: 'line',
          x0: finalArrMz[4].x0,
          x1: finalArrMz[4].x1,
          y0: finalArrMz[4].y0,
          y1: finalArrMz[4].y1
        }],
        xaxis: {
          autorange: true,
          type: 'log'
        },
        yaxis: {
          autorange: true,
          type: 'log'
        },
        showlegend: true,
        title: 'Ось ОX',

      };

      Plotly.newPlot('myDivMZ', dataMZ, layoutMZ);
    }

    else{

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

      var traceAX = {
        y: acsMain.x,
        x: acsMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'rgb(215, 47, 0)'
        },
        name: 'OX'
      };

      var dataAX = [traceAX];


      Plotly.newPlot('myDivAX', dataAX, layout);

      /****************************Y**********************************/

      var traceAY = {
        y: acs.y,
        x: acs.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'green'
        },
        name: 'OY'
      };

      var dataAY = [traceAY];

      Plotly.newPlot('myDivAY', dataAY, layout);

      /****************************Z**********************************/


      var traceAZ = {
        y: acs.z,
        x: acs.time,
        type: 'scatter',
        mode: 'lines',
        name: 'OZ'
      };

      var dataAZ = [traceAZ];


      Plotly.newPlot('myDivAZ', dataAZ, layout);

      /* Графики вариации Аллана для Гироскопа  */

      /****************************X**********************************/

      var traceGX = {
        y: giro.x,
        x: giro.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'blue'
        },
        name: 'OX'
      };

      var dataGX = [traceGX];

      Plotly.newPlot('myDivGX', dataGX, layout);

      /****************************Y**********************************/

      var traceGY = {
        y: giroMain.y,
        x: giroMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'green'
        },
        name: 'OY'

      };

      var dataGY = [traceGY];

      Plotly.newPlot('myDivGY', dataGY, layout);

      /****************************Z**********************************/



      var traceGZ = {
        y: giroMain.z,
        x: giroMain.time,
        type: 'scatter',
        mode: 'lines',
        line: {color: 'red'},
        name:'OZ'
      };

      var dataGZ = [  traceGZ];

      Plotly.newPlot('myDivGZ', dataGZ, layout);



      /* Графики вариации Аллана для Магнитометра  */

      /****************************X**********************************/

      var traceMX = {
        y: mag.x,
        x: mag.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'blue'
        },
        name: 'OX'
      };

      var dataMX = [traceMX];

      Plotly.newPlot('myDivMX', dataMX, layout);

      /****************************Y**********************************/

      var traceMY = {
        y: mag.y,
        x: mag.time,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'green'
        },
        name: 'OY'
      };

      var dataMY = [traceMY];



      Plotly.newPlot('myDivMY', dataMY, layout);

      /****************************Z**********************************/

    //test();

    var traceMZ = {
      y: magMain.z,
      x: magMain.time,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'red'
      },
      name: 'OZ'
    };

    var dataMZ = [traceMZ];

    Plotly.newPlot('myDivMZ', dataMZ, layout);
  }
}
