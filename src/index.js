import { Scene, Clock, PerspectiveCamera, WebGLRenderer } from 'https://cdn.skypack.dev/three@0.129.0';
import Game from './Game.js'

const renderer = new WebGLRenderer();
renderer.setPixelRatio(1)
renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild( renderer.domElement );
document.getElementById('target').appendChild(renderer.domElement);

const scene = new Scene();
const clock = new Clock();
const camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );

//const camPos = new Vector3(-20, 20, 20);
//const camPos = new Vector3(-15, 5, 5);
//camera.position.copy(camPos);
//camera.lookAt( 0, 0, 0 );

const game = new Game(renderer, scene, clock, camera)