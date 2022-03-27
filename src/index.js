import { Scene, Clock, PerspectiveCamera, WebGLRenderer } from 'https://cdn.skypack.dev/three@0.129.0';
import Game from './Game.js'

const renderer = new WebGLRenderer();
renderer.setPixelRatio(1)
renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild( renderer.domElement );
document.getElementById('target').appendChild(renderer.domElement);

const scene = new Scene();
const clock = new Clock();
const camera = new PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 500 );

camera.near = 0.01
camera.updateProjectionMatrix()

const game = new Game(renderer, scene, clock, camera)