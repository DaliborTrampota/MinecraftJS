import * as THREE from 'three';

// init
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.x = 0;
camera.position.z = 2
camera.lookAt(new THREE.Vector3(0, 0, 0))

const scene = new THREE.Scene();

const geometry = new THREE.BufferGeometry();
const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: true })
const material1 = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: false, color: 0xFF0000 })
const material2 = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: false, color: 0x00FF00 })

geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 2, 0, 0]), 3))
geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0]), 2))
// geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1]), 3))
geometry.computeVertexNormals()

geometry.addGroup(0, 3, 0)
geometry.addGroup(6, 3, 0)
geometry.addGroup(3, 3, 1)

const mesh = new THREE.Mesh( geometry, [material1, material2] );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.render( scene, camera );

console.log(renderer.info.render.calls)
