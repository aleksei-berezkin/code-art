#version 300 es

precision highp float;

// (0,0)-(w,h)
in vec2 v_texPosition;
in vec3 v_color;

uniform vec3 u_bg;
uniform sampler2D u_letters;
uniform float u_lettersTexRatio;

out vec4 outColor;

void main() {
    vec2 onePixel = vec2(1) / vec2(textureSize(u_letters, 0));

    // 3x3 pixel-size blur for antialiasing
    vec4 texValue = vec4(0);
    for (int r = -1; r <= 1; r++) {
        for (int c = -1; c <= 1; c++) {
            vec2 texCoord = onePixel * (v_texPosition + .5 * vec2(c, r) * u_lettersTexRatio);
            texValue += texture(u_letters, texCoord);
        }
    }
    texValue /= 9.0;

    // TODO one-pixel blur for anti-aliasing? 
    outColor = vec4(
        texValue.rgb * v_color + u_bg * (vec3(1) - texValue.rgb),
        1
    );
    // Debug:
//     outColor = vec4(v_color, 1);
}
