#version 300 es

in vec2 a_position;

uniform vec2 u_scale;
uniform float u_angle;
uniform vec2 u_translate;

void main() {
    mat4 scale_mat = mat4(
        u_scale[0], 0,          0, 0,
        0,          u_scale[1], 0, 0,
        0,          0,          1, 0,
        0,          0,          0, 1
    );

    mat4 angle_mat = mat4(
        cos(u_angle),  sin(u_angle), 0, 0,
        -sin(u_angle), cos(u_angle), 0, 0,
        0,             0,            1, 0,
        0,             0,            0, 1
    );

    mat4 translate_mat = mat4(
        1, 0, 0, u_translate[0],
        0, 1, 0, u_translate[1],
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    
    gl_Position = vec4(a_position, 0, 1) * scale_mat * angle_mat * translate_mat;
}
