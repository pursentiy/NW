//калибровка акселерометра по считанным только что данным

function calibration(){
  var  A1, A2, A3;
  let pos = 0;
  for( let i = 0; i < 6; i++){
    matrix[pos] = A1 = [meanResuts[i][0], meanResuts[i][1], meanResuts[i][2], 0,0,0,0,0,0,1,0,0]; pos++; 
    matrix[pos] = A2 = [0,0,0,meanResuts[i][0], meanResuts[i][1], meanResuts[i][2],0,0,0,0,1,0]; pos++;  
    matrix[pos] =  A3 = [0,0,0,0,0,0,meanResuts[i][0], meanResuts[i][1], meanResuts[i][2],0,0,1]; pos++;  
  }

  for(let i = 0; i<matrix.length; i++){
    for(let y = 0; y < matrix[i].length; y++){
      matrix[i][y] = +matrix[i][y];
    }
  }

  for(let i = 0; i<Y.length; i++){
    for(let y = 0; y < Y[i].length; y++){
      Y[i][y] = +Y[i][y];
    }
  }
  console.log('\r');
  console.log(matrix);
  console.log('\r');
  matrixReady = math.multiply(math.multiply(math.inv(math.multiply(math.transpose(matrix), matrix)), math.transpose(matrix)), math.transpose(Ymin));
  let y = 0;
  let u = 0;
  let z = 0;
  for( let i = 0 ; i < matrixReady.length; i++){
    matrixReady[i] = matrixReady[i][0].toFixed(3);
    if(i%3 == 0 && i != 0) y++;
    if(y == 3) {
      vector[z] = matrixReady[i];
      z++;
    }
    else{
      matrix3x3[y][u] = matrixReady[i];
      u++;
    }
  }
  console.log(matrixReady);
  console.log('\r');
  console.log('\r');
  console.log("Получается мартица вида:");
  if(devidedMatrix == matrix){
    console.log("Fuck!");
  }
  coeffMatrixSet();
};