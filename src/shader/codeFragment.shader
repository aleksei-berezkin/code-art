#version 300 es

precision highp float;

in vec2 v_texPosition;
in vec3 v_color;

uniform vec3 u_bg;
uniform sampler2D u_letters;

out vec4 outColor;

void main() {
    vec2 onePixel = vec2(1) / vec2(textureSize(u_letters, 0));
    vec4 letterTex = texture(u_letters, onePixel * v_texPosition);

    // TODO one-pixel blur for anti-aliasing? 
    outColor = vec4(
        letterTex.rgb * v_color + u_bg * (vec3(1) - letterTex.rgb),
        1
    );
    // Debug:
//     outColor = vec4(v_color, 1);
}
