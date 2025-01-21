#version 300 es

uniform mat4 u_tx;
uniform vec3 u_bg;

in vec4 a_position;
in vec2 a_glyphTexPosition;
in vec3 a_color;

out vec2 v_texPosition;
out vec3 v_color;

void main() {
    // Swap vector and matrix instead of transposing
    vec4 pos = a_position * u_tx;

    float w = pos.w >= 0.0 ? pos.w : 0.0;
    // z is not divided by w
    gl_Position = vec4(pos.xy / w, pos.z, 1);

    v_texPosition = a_glyphTexPosition;
    v_color = a_color;
}
