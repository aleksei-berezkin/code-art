#version 300 es

precision highp float;

in vec2 v_texPosition;
in vec4 v_color;

uniform vec4 u_bg;
uniform sampler2D u_letters;

out vec4 outColor;

void main() {
    vec2 onePixel = vec2(1) / vec2(textureSize(u_letters, 0));
    vec4 letterTex = texture(u_letters, onePixel * v_texPosition);

    outColor = letterTex * v_color + u_bg * vec4(vec3(1) - letterTex.rgb, 1);
    // Debug:
//     outColor = v_color;
}
