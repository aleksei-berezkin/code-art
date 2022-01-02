#version 300 es

precision highp float;

in vec2 v_texCoords;
in float v_blurRadius;
in float v_w;

uniform sampler2D u_image;
uniform vec3 u_bg;

out vec4 outColor;

void main() {
    // TODO blur

    vec3 outRgb = texture(u_image, v_texCoords).rgb / v_w + u_bg * (1.0 - 1.0 / v_w);

    outColor = vec4(outRgb, 1);
}
