#version 300 es

in vec4 a_position;

uniform vec2 u_mainSizePx;

uniform vec2 u_attrFromPx;
uniform vec2 u_attrSizePx;

uniform vec2 u_selfAttrFromPx;
uniform vec2 u_selfAttrSizePx;

out vec2 v_mainPosTx;
out vec2 v_attrPosTx;
out vec2 v_selfAttrPosTx;

void main() {
    gl_Position = a_position;

    v_mainPosTx = (a_position.xy * vec2(1, -1) + 1.0) / 2.0;
    vec2 mainPosPx = u_mainSizePx * v_mainPosTx;

    v_attrPosTx = (mainPosPx - u_attrFromPx) / u_attrSizePx;
    v_selfAttrPosTx = (mainPosPx - u_selfAttrFromPx) / u_selfAttrSizePx;
}
