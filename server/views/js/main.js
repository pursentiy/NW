/***********************************************************************************************/
//Серверная часть

var obj = {};
var data, dataCOM, select = document.getElementById("example-select"), checkingCOM = false, data = {}, speedInput = document.getElementById("speed-input");
var roll, cockpitNum = [];
var socket = io(); 

var angleAplhacheck = 0;
var check = false;
var scale = 1;
var startCheck = false;

var gn = new GyroNorm();


gn.init().then(function(){
	gn.start(function(data){
		if(startCheck){
			//text1.innerHTML = 79.5 + (angleAplhacheck - data.do.alpha)/scale;
			//text2.innerHTML = data.do.gamma;

			if(!check){
				angleAplhacheck = data.do.alpha;
				check = true;
				scale = angleAplhacheck/14;
			}


			$('header .mainBlock1 .cockpit .elements .blockHaw .background').css({
				top: ((data.do.gamma+15)/2.5) + 'px'
			});	

		if((79.5 + (angleAplhacheck - data.do.alpha)/scale) < 93.5 && (79.5 + (angleAplhacheck - data.do.alpha)/scale) > 64.5){
			$('header .mainBlock1 .cockpit .elements .blockPitch .circle').css({
				left: (79.5 + (angleAplhacheck - data.do.alpha)/scale) + 'px'
			});
		}
		

		
		if(data.do.beta <= 90 && data.do.beta >= -90){
			$('header .mainBlock1 .cockpit .elements .blockHaw .cirle').css({
				transform: 'rotate('+(data.do.beta) +'deg)'
			});	
		}

		if(data.do.beta < 30 && data.do.beta > -30){
			$('header .mainBlock1 .cockpit .elements .blockPitch .arrow').css({
				transform: 'rotate('+(data.do.beta) +'deg)'
			});
		}

		$('header .mainBlock1 .cockpit .elements .blockRoll .background').css({
			transform: 'rotate('+(data.do.alpha) +'deg)'
		});



    // Process:
    // data.do.alpha	( deviceorientation event alpha value )
    // data.do.beta		( deviceorientation event beta value )
    // data.do.gamma	( deviceorientation event gamma value )
    // data.do.absolute	( deviceorientation event absolute value )

    // data.dm.x		( devicemotion event acceleration x value )
    // data.dm.y		( devicemotion event acceleration y value )
    // data.dm.z		( devicemotion event acceleration z value )

    // data.dm.gx		( devicemotion event accelerationIncludingGravity x value )
    // data.dm.gy		( devicemotion event accelerationIncludingGravity y value )
    // data.dm.gz		( devicemotion event accelerationIncludingGravity z value )

    // data.dm.alpha	( devicemotion event rotationRate alpha value )
    // data.dm.beta		( devicemotion event rotationRate beta value )
    // data.dm.gamma	( devicemotion event rotationRate gamma value )
  }
});
}).catch(function(e){
  // Catch if the DeviceOrientation or DeviceMotion is not supported by the browser or device
});


function rotate(){
	setTimeout(function() {
		$('.window').css('display', 'block');
		setTimeout(function() {
			$('.window').css('opacity', '1');
		}, 100);

		$('.overlay ').css('display', 'block');
		setTimeout(function() {
			$('.overlay ').css('opacity', '0.7');
		}, 100);
	}, 500);
}


if(window.orientation != (90)){
	if(window.orientation == 0 || window.orientation == -90) $('.arrowRotate').css('transform','scaleX(-1)');
	else $('.arrowRotate').css('transform','scaleX(1)');
	//alert("угол" + window.orientation);
	rotate()
}

window.addEventListener("orientationchange", function() {
	//alert(window.orientation);
	if(window.orientation == 0 || window.orientation == -90) $('.arrowRotate').css('transform','scaleX(-1)');
	else if(window.orientation == 180) $('.arrowRotate').css('transform','scaleX(1)');
	else overlayDown();

	if(window.orientation != (90)){
		rotate()
	}
}, false);

$('#cockpitStart').on('click', function() {
	startCheck = true;
});

//Закрытие всплавающего окна с подсказками
$('#button_window').on('click', function() {
	overlayDown();
	});

function overlayDown(){
	setTimeout(function() {
		$('.window').css('display', 'none');
	}, 200);
	$('.window').css('opacity', '0');
	$('.overlay ').css('display', 'none');
	setTimeout(function() {
		$('.overlay ').css('opacity', '0');
	}, 300);
}

function SerialPortStart(){
	//var xhr = new XMLHttpRequest();
	//setInterval(function() {
	//	xhr.open('GET', 'cockpit.json', true);
	//	xhr.send();
				/*if (this.readyState != 4) return;
				if( this.status != 200){
					alert ('ошибка: ' + (this.status ? this.statusText : 'запрос не удался') );
					return;
				} */
		//		xhr.onreadystatechange = function() {
				//	if(this.status == 200) {

							//	}
				//			}
		//				}, 50);
	};

	socket.on('input', function(angles){ 
		if(angles != 0){
			var data = angles;
			console.log(angles);
			obj = data.split(';');
			if(cockpitNum[3] != null){
				$('header .mainBlock1 .cockpit .elements .blockHaw .cirle').css({
					transform: 'rotate('+(obj[cockpitNum[3]]) +'deg)'
				});	}	
				else{
					$('header .mainBlock1 .cockpit .elements .blockHaw .cirle').css({
						transform: 'rotate('+(obj[0]) +'deg)'
					});
					if(obj[0]>= -28 && obj[0]<=28){
						$('header .mainBlock1 .cockpit .elements .blockPitch .arrow').css({
							transform: 'rotate('+(obj[0]) +'deg)'
						});
					}

				}	
				if(cockpitNum[4] != null){	
					$('header .mainBlock1 .cockpit .elements .blockHaw .background').css({
						top: ((-1)*(+obj[cockpitNum[4]])) + 'px'
					});	}
					else{
						$('header .mainBlock1 .cockpit .elements .blockHaw .background').css({
							top: ((-1)*(+obj[1])) + 'px'
						});
					}
					if(cockpitNum[2] != null){	
						$('header .mainBlock1 .cockpit .elements .blockRoll .background').css({
							transform: 'rotate('+(+(obj[cockpitNum[2]])) +'deg)'
						});}
						else{
							$('header .mainBlock1 .cockpit .elements .blockRoll .background').css({
								transform: 'rotate('+(+obj[2]) +'deg)'
							});

						}
					}

				});

	$(function(){

		$('#click').click(function(){
			$('.wrapper').toggleClass('open_settings');
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

			//SerialPortStart();
		//	valueCounting();

	});

	});









	/***********************************************************************************************/
//front-end
$(function() {

	var tru = 0;minP=-45, maxP=45, minPC=58, maxPC=99, minH = -95, maxH = 95, click = 0, minV=-15, maxV=34, minHow=0, maxHow=361, val = 0;
	var timerId, timerIdRoll, timerIdHow, timerIdPitch;

	function valueCounting(a){
		if(a==undefined){
			a=1000
		}
		valueA = a;
		console.log(tru);
		
				//clearInterval(timerIdRoll);
		//clearInterval(timerIdHow);
		//clearInterval(timerIdPitch);

		timerIdRoll = setInterval(function() {
			$('header .mainBlock1 .cockpit .elements .blockHaw .cirle').css({
				transform: 'rotate('+(obj[1]) +'deg)'
			});
			$('header .mainBlock1 .cockpit .elements .blockHaw .background').css({
				top: (minV + Math.random() * (maxV - minV)) +'px'
			});
		},200);

		timerIdHow = setInterval(function() {
			$('header .mainBlock1 .cockpit .elements .blockRoll .background').css({
				transform: 'rotate('+(minHow + Math.random() * (maxHow - minHow)) +'deg)'
			});

		},valueA);

		timerIdPitch = setInterval(function() {
			$('header .mainBlock1 .cockpit .elements .blockPitch .arrow').css({
				transform: 'rotate('+(minP + Math.random() * (maxP - minP)) +'deg)'
			});
			$('header .mainBlock1 .cockpit .elements .blockPitch .circle').css({
				left: (minPC + Math.random() * (maxPC - minPC)) +'px'
			});
		},valueA);

	}

//Меню
$('.button_toggle').on('click',function(){
    //$('.main_navigation').toggleClass('open');
    $('.wrapper').toggleClass('open_menu');
  });


//Вкладка1
$('#first').on('click',function(){
	console.log("Pressed")
	$('header .mainBlock1').css({
		display: "block"
	});
	$('header .mainBlock2').css({
		display: "none"
	});
	$('header .mainBlock3').css({
		display: "none"
	});
	$('header .mainBlock4').css({
		display: "none"
	});
});


//Вкладка 2
$('#second').on('click',function(){
	console.log("Pressed")
	$('header .mainBlock1').css({
		display: "none"
	});
	$('header .mainBlock2').css({
		display: "block"
	});
	$('header .mainBlock3').css({
		display: "none"
	});
	$('header .mainBlock4').css({
		display: "none"
	});
});

//Вкладка 3
$('#third').on('click',function(){
	console.log("Pressed")
	$('header .mainBlock1').css({
		display: "none"
	});
	$('header .mainBlock2').css({
		display: "none"
	});
	$('header .mainBlock3').css({
		display: "block"
	});
	$('header .mainBlock4').css({
		display: "none"
	});
});


//Вкладка 4
$('#fourth').on('click',function(){
	console.log("Pressed")
	$('header .mainBlock1').css({
		display: "none"
	});
	$('header .mainBlock2').css({
		display: "none"
	});
	$('header .mainBlock3').css({
		display: "none"
	});
	$('header .mainBlock4').css({
		display: "block"
	});
});

/*Прерывание по нажатию*/


$('.proMode').on('click',function(){ 
	if($(this).is(":checked")) { $('.additionalSett').toggleClass('onDisplay') }
		else {$('.additionalSett').toggleClass('onDisplay')}
	});


});

