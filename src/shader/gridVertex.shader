#version 300 es

uniform mat4 u_tx;
uniform vec4 u_bg;

in vec4 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
    // Swap vector and matrix instead of transposing
    vec4 pos = a_position * u_tx;

    float w = pos.w >= 0.0 ? pos.w : 0.0;
    // z is not divided by w
    gl_Position = vec4(pos.xy / w, pos.z, 1);

    v_color = vec4(a_color.rgb / w, 1) + u_bg * (1.0 - 1.0 / w);
}
