uniform float time;
uniform float animFrame;

attribute vec2 chunkPos;
attribute float ao;

varying vec2 vUV;
varying float vAO;
varying vec3 vNormal;


void main(){
    vUV = vec2(uv.x, uv.y + animFrame); 
    vAO = ao;
    vNormal = normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
