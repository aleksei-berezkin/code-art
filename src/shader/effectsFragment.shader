#version 300 es

precision highp float;

in vec2 v_texPosition;
in float v_w;

uniform sampler2D u_image;
uniform vec3 u_bg;

out vec4 outColor;

void main() {
    // x: -1..+1 -> 0..1
    // y: -1..+1 -> 1..0
    float texX = (v_texPosition.x + 1.0) / 2.0;
    float texY = 1.0 - (v_texPosition.y + 1.0) / 2.0;

    vec3 outRgb = texture(u_image, vec2(texX, texY)).rgb / v_w + u_bg * (1.0 - 1.0 / v_w);

    outColor = vec4(outRgb, 1);
}
