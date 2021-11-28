#version 300 es

uniform mat4 u_tx;

in vec4 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
    // Swap vector and matrix instead of transposing
    gl_Position = a_position * u_tx;
    v_color = a_color;
}
