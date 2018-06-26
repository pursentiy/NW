//Расчет вариации Аллана на локальном компьютере из выборки(сырые данные), снятой заранее и записанной в json файл

function allanVar(e){
  var arrAl = [];
  let test = 0;
  if(e){

  }
  else{
    fs.readFile('json/allan.json', function(err, data) {
      if (err) throw err;
      test = JSON.parse(data);
    //console.log("shereArr = ", shereArr);
  });
  }



  setTimeout(function(){
    arrAl[0] = test.allan.giro.x;
    arrAl[1] = test.allan.giro.y;
    arrAl[2] = test.allan.giro.z;

    arrAl[3] = test.allan.mag.x;
    arrAl[4] = test.allan.mag.y;
    arrAl[5] = test.allan.mag.z;

    arrAl[6] = test.allan.acs.x;
    arrAl[7] = test.allan.acs.y;
    arrAl[8] = test.allan.acs.z;
    //arrAl[1] = test.allan.acs.y;
    arrAl[9] = test.allan.time;

    var allanGX = [], allanGY = [], allanGZ = [],
    allanAX = [], allanAY = [], allanAZ = [], 
    allanMX = [], allanMY = [], allanMZ = [];
    var time = [];

    var sumGX = 0, sumGY = 0, sumGZ = 0,
    sumAX = 0, sumAY = 0, sumAZ = 0,
    sumMX = 0, sumMY = 0, sumMZ = 0;
//длина выборки окон
var N = 165000;
let n = 1;

var testSumAx = [],testSumAy = [],testSumAz = [];
var testSumGx = [],testSumGy = [],testSumGz = [];
var testSumMx = [],testSumMy = [],testSumMz = [];
var count = 10;

//общее количество циклов
for(let mult = 1; mult <= 70000; mult += 2){

  count *= mult;
  if(count == 30010) {
    console.log();
  }
        //усредненное значение  для дальнейшего расчета
        for(let n = 0; n < N; n += count){
      //if(n <= ((N-1)/2 - 1)) n++;
     // for(let k = 0; k < (N-2*n); k++){
      let sumAx = 0, sumAy = 0, sumAz = 0;
      let sumMx = 0, sumMy = 0, sumMz = 0;
      let sumGx = 0, sumGy = 0, sumGz = 0;
      for(let k = n; k < n+count; k++){
        let zer0 = 0;
        if(k < arrAl[6].length){
          sumAx += +arrAl[6][k];
          sumAy += +arrAl[7][k];
          sumAz += +arrAl[8][k];

          sumGx += +arrAl[0][k];
          sumGy += +arrAl[1][k];
    /*      if((zer0 = +arrAl[2][k] + sumGz) == 0){
            console.log("pizdec");
          } */
          sumGz += +arrAl[2][k]

          sumMx += +arrAl[3][k];
          sumMy += +arrAl[4][k];
          sumMz += +arrAl[5][k];
        }
      }
      sumAx /= count, sumAy /= count, sumAz /= count;
      sumGx /= count, sumGy /= count;
      sumGz /= count;
      sumMx /= count, sumMy /= count, sumMz /= count;

      testSumAx.push(sumAx);
      testSumAy.push(sumAy);
      testSumAz.push(sumAz);

      testSumGx.push(sumGx);
      testSumGy.push(sumGy);
      if(sumGz == 0){

      }
      else testSumGz.push(sumGz);
      
      testSumMx.push(sumMx);
      testSumMy.push(sumMy);
      testSumMz.push(sumMz);
      

      sumAx = 0;
      sumAy = 0
      sumAz = 0

      sumGx = 0;
      sumGy = 0
      sumGz = 0
      
      sumMx = 0;
      sumMy = 0
      sumMz = 0
      
    }
    for(let i = 0; i < testSumAx.length - 1; i++){

      sumAX += math.pow((testSumAx[i+1] - testSumAx[i]),2);
      sumAY += math.pow((testSumAy[i+1] - testSumAy[i]),2);
      sumAZ += math.pow((testSumAz[i+1] - testSumAz[i]),2);

      sumGX += math.pow((testSumGx[i+1] - testSumGx[i]),2);
      sumGY += math.pow((testSumGy[i+1] - testSumGy[i]),2);
      sumGZ += math.pow((testSumGz[i+1] - testSumGz[i]),2);
      
      sumMX += math.pow((testSumMx[i+1] - testSumMx[i]),2);
      sumMY += math.pow((testSumMy[i+1] - testSumMy[i]),2);
      sumMZ += math.pow((testSumMz[i+1] - testSumMz[i]),2);
      
    }

    sumAX *= 1/(2*(testSumAx.length - 1));
    sumAX = math.sqrt(sumAX);
    sumAY *= 1/(2*(testSumAy.length - 1));
    sumAY = math.sqrt(sumAY);
    sumAZ *= 1/(2*(testSumAz.length - 1));
    sumAZ = math.sqrt(sumAZ);

    sumGX *= 1/(2*(testSumGx.length - 1));
    sumGX = math.sqrt(sumGX);
    sumGY *= 1/(2*(testSumGy.length - 1));
    sumGY = math.sqrt(sumGY);
    sumGZ *= 1/(2*(testSumGz.length - 1));
    sumGZ = math.sqrt(sumGZ);
    

    sumMX *= 1/(2*(testSumMx.length - 1));
    sumMX = math.sqrt(sumMX);
    sumMY *= 1/(2*(testSumMy.length - 1));
    sumMY = math.sqrt(sumMY);
    sumMZ *= 1/(2*(testSumMz.length - 1));
    sumMZ = math.sqrt(sumMZ);

    

    allanAX.push(sumAX);
    sumAX = 0;
    testSumAx.length = 0
    allanAY.push(sumAY);
    sumAY = 0;
    testSumAy.length = 0
    allanAZ.push(sumAZ);
    sumAZ = 0;
    testSumAz.length = 0;

    allanGX.push(2*sumGX);
    sumGX = 0;
    testSumGx.length = 0
    allanGY.push(2*sumGY);
    sumGY = 0;
    testSumGy.length = 0
    allanGZ.push(2*sumGZ);
    sumGZ = 0;
    testSumGz.length = 0


    allanMX.push(sumMX);
    sumMX = 0;
    testSumMx.length = 0
    allanMY.push(sumMY);
    sumMY = 0;
    testSumMy.length = 0
    allanMZ.push(sumMZ);
    sumMZ = 0;
    testSumMz.length = 0


    time.push(count);
    
    console.log(mult);
    count = 10;





  }

  allanVar = {
    AX:[],
    AY:[],
    AZ:[],
    MX:[],
    MY:[],
    MZ:[],
    GX:[],
    GY:[],
    GZ:[],
    Time:[]
  };
  for(let i = 0; i < allanAX.length; i++){
    allanVar.AX.push(allanAX[i]);
    allanVar.AY.push(allanAY[i]);
    allanVar.AZ.push(allanAZ[i]);

    allanVar.MX.push(allanMX[i]);
    allanVar.MY.push(allanMX[i]);
    allanVar.MZ.push(allanMX[i]);

    allanVar.GX.push(allanGX[i]);
    allanVar.GY.push(allanGX[i]);
    allanVar.GZ.push(allanGX[i]);
    allanVar.Time.push(time[i]);
  }

  arr = {
    allanVar: allanVar
  } 

  fs.writeFileSync('json/allanVarianceClean1.json',JSON.stringify({allanVar}, null, 4));

  /* Графики вариации Аллана для Акселерометра  */

  mapApproximation();
  tangentCheck = true;
  mapRouting();
  coefCount();
  avarCoef();
  avarGystogramms();
  plotInserting();

},4000);
}
setTimeout(function() {
 //allanVar();
},3000);