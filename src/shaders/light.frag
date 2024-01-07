uniform sampler2D texture1;
uniform vec3 lightDir;
// uniform vec2 resolution;

varying vec2 vUV;
varying float vAO;
varying vec3 vNormal;



void main() {
    //gl_FragColor = vec4(gl_FragCoord.y/resolution.y, 0.0, 1.0, 1.0);

    vec4 col = sRGBTransferOETF(texture2D(texture1, vUV)); // https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/colorspace_pars_fragment.glsl.js
    float light = clamp(dot(vNormal, lightDir), 0.0, 1.0);// * 0.65;
    if (light == 0.0) light = 0.80;
    //float light = 1.0;

    vec3 aoCol = vec3(1.0, 1.0, 1.0) * vAO;
    gl_FragColor = vec4(col.xyz * light * aoCol, col.a);
}