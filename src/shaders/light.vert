uniform float time;
uniform float animFrame;

attribute float ao;
attribute vec2 chunkPos;

varying vec2 vUV;
varying float vAO;
varying vec3 vNormal;
varying vec3 vVertex;
flat varying vec2 vChunkPos;


void main(){
    vUV = vec2(uv.x, uv.y + animFrame); 
    if (ao == 0.0) vAO = 1.0;
    else vAO = ao;

    vNormal = normal;
    vVertex = position;
    vChunkPos = chunkPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
