#version 300 es

uniform mat4 u_tx;

uniform float u_xMax;
uniform float u_yMax;
uniform float u_zBase;

uniform float u_focalLength;
uniform float u_distanceToSensor;
uniform float u_lensDiameter;

in vec4 a_position;

out vec2 v_texCoords;
out vec2 v_blurTexCoordsRadii;
out float v_w;

void main() {
    // Swap vector and matrix instead of transposing
    vec4 pos = a_position * u_tx;

    float w = pos.w >= 0.0 ? pos.w : 0.0;
    gl_Position = vec4(pos.xy / w, 0, 1);

    // x: -1..+1 -> 0..1
    // y: -1..+1 -> 1..0
    v_texCoords = vec2(
        (gl_Position.x + 1.0) / 2.0,
        1.0 - (gl_Position.y + 1.0) / 2.0
    );

    float distanceToSubject = w * u_zBase;
    float distanceToImage = 1.0 / (1.0 / u_focalLength - 1.0 / distanceToSubject);
    // May be negative - this guarantes pass through 0.0
    float blurRadius = u_lensDiameter / 2.0 / distanceToImage * (u_distanceToSensor - distanceToImage);

    // x: -xMax..+xMax -> -.5..+.5
    // y: -yMax..+yMax -> +.5..-.5
    v_blurTexCoordsRadii = vec2(
        blurRadius / u_xMax / 2.0,
        blurRadius / u_yMax / -2.0
    );

    v_w = w;
}
