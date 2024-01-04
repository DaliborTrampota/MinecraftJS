import * as THREE from 'three';

// init
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.x = -2
camera.position.z = 2
camera.position.y = 2
camera.lookAt(new THREE.Vector3(0, 0, 0))

const scene = new THREE.Scene();

const vertices = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(1, 1, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, 1),
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(0, 0, 1)
]
const triangles = {
    north: [
        4, 5, 7,
        5, 7, 6
    ],
    south: [
        0, 2, 1,
        0, 3, 2
    ],
    up: [
        2, 3, 4,
        2, 4, 5
    ],
    down: [
        0, 6, 7,
        0, 1, 6
    ],
    west: [
        1, 2, 5,
        1, 5, 6
    ],
    east: [
        0, 7, 4,
        0, 4, 3
    ]
}
const UVs = {
    north: [
        1, 1,
        0, 1,
        1, 0,
        0, 0,
    ],
    south: [
      1, 0,
      0, 1,
      0, 0,
      1, 1
    ],
    up: [
        1, 1,
        0, 1,
        0, 0,
        1, 0,
    ],
    down: [
      0, 1,
      1, 0,
      0, 0,
      1, 1,
    ],
    west: [
      1, 0,
      1, 1,
      0, 1,
      0, 0
    ],
    east: [
        0, 0,
        0, 1,
        1, 1,
        1, 0,
    ]
}
const geometry2 = new THREE.BufferGeometry();
scene.add(new THREE.AxesHelper())

let side = 'north'
let verts = []
const uniqueVerts = new Set(triangles[side])
//console.log(uniqueVerts)
for(let vert of uniqueVerts) {
    verts.push(vertices[vert].x)
    verts.push(vertices[vert].y)
    verts.push(vertices[vert].z)
}

const uniqueValues = [...uniqueVerts];
const indices = triangles[side].map(value => uniqueValues.indexOf(value));
geometry2.setIndex(indices)
geometry2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts.map(v => v/3)), 3))
geometry2.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(UVs[side]), 2))

const loader = new THREE.TextureLoader(THREE.DefaultLoadingManager)
const img = loader.load('https://play-lh.googleusercontent.com/IeNJWoKYx1waOhfWF6TiuSiWBLfqLb18lmZYXSgsH1fvb8v1IYiZr5aYWe0Gxu-pVZX3')

const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: img });

const mesh = new THREE.Mesh( geometry2, material );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

// animation
function animation( time ) {
  // mesh.rotation.x = time / 2000;
  // mesh.rotation.y = time / 1000;

  renderer.render( scene, camera );
}

//https://playcode.io/three