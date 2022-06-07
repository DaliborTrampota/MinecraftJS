import { Scene, Clock, PerspectiveCamera, WebGLRenderer } from 'https://cdn.skypack.dev/three@0.141.0';
import Game from './Game.js'
import PhotoBooth from './tools/PhotoBooth.js';

const renderer = new WebGLRenderer();
renderer.setPixelRatio(1)
renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild( renderer.domElement );
document.getElementById('target').appendChild(renderer.domElement);

window.getBlockImage = PhotoBooth
window.scene = new Scene();
window.clock = new Clock();
const camera = new PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 500 );

camera.near = 0.01
camera.updateProjectionMatrix()


function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize( container.clientWidth, container.clientHeight );
}

document.onresize = onWindowResize
new Game(renderer, camera)