var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

container = document.getElementById( 'canvas' );
//document.body.appendChild( container );
var width =  container.getBoundingClientRect();

var renderer = new THREE.WebGLRenderer();
renderer.setSize( $("#canvas").width(), $("#canvas").height() );
renderer.setClearColor( 0xffffff );
container.appendChild( renderer.domElement );



var  geometry = new THREE.BoxGeometry( 2,1,2 );
var cubeMaterials = 
[
new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/crate.jpg'), side: THREE.DoubleSide}),
new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/crate.jpg'), side: THREE.DoubleSide}),
new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/crate.jpg'), side: THREE.DoubleSide}),
new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/crate.jpg'), side: THREE.DoubleSide}),
new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/crate.jpg'), side: THREE.DoubleSide}),
new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/crate.jpg'), side: THREE.DoubleSide})
];

var material = new THREE.MeshFaceMaterial(cubeMaterials);
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 3;
camera.position.x = 0;
camera.position.y = 0;

var update = function(){
  cube.rotation.x += 0.001;
  cube.rotation.y += 0.001;
};

controls = new THREE.OrbitControls(camera, renderer.domElement);

var render = function(){
  renderer.render (scene, camera);
}

var gameLoop = function() {
  requestAnimationFrame(gameLoop);
  update();
  render();
}

gameLoop();

