//калибровка магнитометра в режиме чтения сырых данных из файла

function magnetometrCalibration(arr){
  var dataColibrationArr = [[],[],[]];
  var dataColibration = 0;
  var dest2 = [];
  if(arr){
    dataColibrationArr[0] = arr.sortArr.x;
    dataColibrationArr[1] = arr.sortArr.y;
    dataColibrationArr[2] = arr.sortArr.z;
  }
  else{
    fs.readFile('json/matrix1.json', function(err, data) {
      if (err) throw err;
      dataColibration = JSON.parse(data);
      dataColibrationArr[0] = dataColibration.magnitron.sortArr.x;
      dataColibrationArr[1] = dataColibration.magnitron.sortArr.y;
      dataColibrationArr[2] = dataColibration.magnitron.sortArr.z;
    });
  }

  setTimeout(function(){
    let yPow = [];
    let zPow = [];
    let arr  = [[],[],[],[],[],[1]];

    arr[0] = dataColibrationArr[0];
    arr[1] = dataColibrationArr[1];
    arr[2] = dataColibrationArr[2];


    for( let i =0; i < dataColibrationArr[1].length; i++){
      arr[3].push(Math.pow(dataColibrationArr[1][i], 2));
    }

    for( let i = 0; i < arr[3].length; i++){
      arr[3][i] *= -1;
      arr[3][i] = +arr[3][i].toFixed(3);
    }

    for( let i =0; i < dataColibrationArr[2].length; i++){
      arr[4].push(Math.pow(dataColibrationArr[2][i], 2));
    }

    let xPow = [];
    for( let i =0; i < dataColibrationArr[0].length; i++){
      xPow.push(Math.pow(dataColibrationArr[0][i], 2));
    }

    for( let i = 0; i < arr[4].length; i++){
      arr[4][i] *= -1;
      arr[4][i] = +arr[4][i].toFixed(3);
      if (i > 0) arr[5].push(1);
    }

    var ii =0, sample_count = 0;
    var mag_bias = [0, 0, 0], mag_scale = [0, 0, 0];
    var mag_min = [-1, -1, -1], mag_max = [1, 1, 1];

    for( let jj = 0; jj < 3; jj++){
      for( let i = 0; i < dataColibrationArr[jj].length; i++){
        if(dataColibrationArr[jj][i] > mag_max[jj]) mag_max[jj] = dataColibrationArr[jj][i];
        if(dataColibrationArr[jj][i] < mag_min[jj]) mag_min[jj] = dataColibrationArr[jj][i];
      }
    }

    if(mag_max[1] == 1 && mag_min[1] == -1){

      Array.prototype.max = function() {
        return Math.max.apply(null, this);
      };

      Array.prototype.min = function() {
        return Math.min.apply(null, this);
      };

      mag_max[0] = dataColibrationArr[0].max();
      mag_min[0] = dataColibrationArr[0].min();

      mag_max[1] = dataColibrationArr[1].max();
      mag_min[1] = dataColibrationArr[1].min();

      mag_max[2] = dataColibrationArr[2].max();
      mag_min[2] = dataColibrationArr[2].min();

      var magArrM = [[0,0,0],[0,0,0],[0,0,0]];
      var MAG_MAX_CYCLE = true;
      let FIELD_MAG = 1;
      var MAG_MAX_COUNT = dataColibrationArr[1].length;
      var magArrValue = [];
      for(let i =0; i< MAG_MAX_COUNT; i++){
        magArrValue[i] = [dataColibrationArr[0][i], dataColibrationArr[1][i], dataColibrationArr[2][i]];
      }
      var magCountNow = 0;

      magArrM[0][3] = +((mag_max[0] + mag_min[0])/2).toFixed(5);
      magArrM[1][3] = +((mag_max[1] + mag_min[1])/2).toFixed(5);
      magArrM[2][3] = +((mag_max[2] + mag_min[2])/2).toFixed(5);
      magArrM[0][0] = 2*FIELD_MAG/+((mag_max[0] - mag_min[0])/2).toFixed(5);
      magArrM[1][1] = 2*FIELD_MAG/+((mag_max[1] - mag_min[1])/2).toFixed(5);
      magArrM[2][2] = 2*FIELD_MAG/+((mag_max[2] - mag_min[2])/2).toFixed(5);

      for(let cycle = 0; cycle<magArrValue[1].length; cycle++) {
        var errLast = getSumError(0, 0, 0);
        console.log(errLast);
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 4; x++) {
                    //if(x!=y) {
                        //Log.d(tag, errLast + "");
                        if (getSumError(y, x, 0.01) < errLast)
                          magArrM[y][x] += 0.01;
                        if (getSumError(y, x, -0.01) < errLast)
                          magArrM[y][x] -= 0.01;
                    //}
                  }
                }
              }

              function getSumError(y, x, ds){
                magArrM[y][x] += ds;
                let sumError = 0;
                let magCountRasErr = magCountNow;
                if(MAG_MAX_CYCLE)
                  magCountRasErr = MAG_MAX_COUNT;
                for(let i=0; i<magCountRasErr; i++){
                  sumError += Math.pow(
                    Math.sqrt(
                      Math.pow(magArrValue[i][0]*magArrM[0][0] + magArrValue[i][1]*magArrM[0][1] + magArrValue[i][2]*magArrM[0][2] + magArrM[0][3], 2) +
                      Math.pow(magArrValue[i][0]*magArrM[1][0] + magArrValue[i][1]*magArrM[1][1] + magArrValue[i][2]*magArrM[1][2] + magArrM[1][3], 2) +
                      Math.pow(magArrValue[i][0]*magArrM[2][0] + magArrValue[i][1]*magArrM[2][1] + magArrValue[i][2]*magArrM[2][2] + magArrM[2][3], 2))
                    - FIELD_MAG,
                    2);
                }
                magArrM[y][x] -= ds;
                return sumError/magCountRasErr;
              }

              for(let i =0; i< MAG_MAX_COUNT; i++){
                magArrValue[i][3] = 1;
              };
              var matrixMagCalibrated = [];
              for(let i = 4; i < magArrValue.length; i+=4){
                let buf = [];
                for( let y = i -4; y < i; y++){
                  buf.push(magArrValue[y]);
                }
                let mult = math.multiply(magArrM, buf);
                buf = [];
                matrixMagCalibrated.push(mult);
              }

              var magCalibrSortMatr = [[],[],[]];
              for(let i =0; i < matrixMagCalibrated.length; i++){
                for(let y = 0; y < matrixMagCalibrated[i].length; y++){
                  magCalibrSortMatr[0].push(matrixMagCalibrated[i][y][0]);
                  magCalibrSortMatr[1].push(matrixMagCalibrated[i][y][1]);
                  magCalibrSortMatr[2].push(matrixMagCalibrated[i][y][2]);
                }
              }

              //var matr = math.multiply(magArrM, magArrValue);

              $('#close ').css(
                'display','none');
              $('.wrapCalab .block5').css(
                'padding','34px');
                  $('#myDiv2').css(
                'display','block');



              let test1 = magCalibrSortMatr[0].max();
              let test2 = magCalibrSortMatr[0].min();

              var trace2 = {
                x: magCalibrSortMatr[0], y: magCalibrSortMatr[1], z: magCalibrSortMatr[2],
                mode: 'markers',
                marker: {
                  size: 4,
                  line: {
                    color: 'rgba(217, 217, 217, 0.14)',
                    width: 0.5},
                    opacity: 0.8},
                    type: 'scatter3d',
                    name:'Калиброванная'
                  };

                  var trace1 = {
                    x: dataColibrationArr[0], y: dataColibrationArr[1], z: dataColibrationArr[2],
                    mode: 'markers',
                    marker: {
                      size: 4,
                      line: {
                        color: 'rgba(117, 117, 117, 0.14)',
                        width: 0.5},
                        opacity: 0.8},
                        type: 'scatter3d',
                        name:'Некалиброванная'
                      };



                      var data = [trace1, trace2];
                      var layout = {
                        showlegend: true,
                        legend: {"orientation": "h"},
                        margin: {
                          l: 0,
                          r: 0,
                          b: 0,
                          t: 0
                        }};
                        Plotly.newPlot('myDiv2', data, layout);

                      }
                      else{}



                    },3000);

}