#version 300 es

uniform mat4 u_tx;

in vec4 a_position;

out vec2 v_texPosition;
out float v_w;

void main() {
    // Swap vector and matrix instead of transposing
    vec4 pos = a_position * u_tx;

    float w = pos.w >= 0.0 ? pos.w : 0.0;
    v_texPosition = pos.xy / w;
    gl_Position = vec4(v_texPosition, 0, 1);

    v_w = w;
}
