uniform sampler2D textureAtlas;
uniform vec3 lightDir;
uniform vec3 cameraPos;


varying vec2 vUV;
varying float vAO;
varying vec3 vNormal;
varying vec3 vVertex;
flat varying vec2 vChunkPos;

const float FOG_MIN = 30.0;
const float FOG_MAX = 50.0;
const vec4 FOG_COL = vec4(80.0/255.0, 207.0/255.0, 242.0/255.0, 1.0);

float getFogFactor(float d)
{
    if (d >= FOG_MAX) return 1.0;
    if (d <= FOG_MIN) return 0.0;

    return 1.0 - (FOG_MAX - d) / (FOG_MAX - FOG_MIN);
}

void main() {
    //gl_FragColor = vec4(gl_FragCoord.y/resolution.y, 0.0, 1.0, 1.0);

    vec4 col = sRGBTransferOETF(texture2D(textureAtlas, vUV)); // https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/colorspace_pars_fragment.glsl.js
    float light = clamp(dot(vNormal, lightDir), 0.0, 1.0);// * 0.65;
    if (light == 0.0) light = 0.80;
    //float light = 1.0;

    // vec3 chunkMulti = vec3(vChunkPos.x * 16.0, 0.0, vChunkPos.y * 16.0);
    // float dist = distance(cameraPos, vVertex + chunkMulti);
    // float alpha = getFogFactor(dist);//clamp(1.0 - (FOG_MAX - dist)/(FOG_MAX - FOG_MIN), 0.0, 1.0)



    vec3 aoCol = vec3(1.0, 1.0, 1.0) * vAO;
    // gl_FragColor = mix(vec4(col.xyz * light * aoCol, col.a), FOG_COL, alpha); 
    gl_FragColor = vec4(col.xyz * light * aoCol, col.a);
    //gl_FragColor = vec4(vUV.x, 0.0, vUV.y, 1.0);
}