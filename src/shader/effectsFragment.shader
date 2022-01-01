#version 300 es

precision highp float;

in vec2 v_texPosition;
in float v_w;

uniform sampler2D u_image;

uniform float u_zBase;
uniform float u_focalLength;
uniform float u_distanceToSensor;
uniform float u_lensDiameter;

uniform vec3 u_bg;

out vec4 outColor;

void main() {
    // x: -1..+1 -> 0..1
    // y: -1..+1 -> 1..0
    float texX = (v_texPosition.x + 1.0) / 2.0;
    float texY = 1.0 - (v_texPosition.y + 1.0) / 2.0;

    float distanceToSubject = v_w * u_zBase;
    float distanceToImage = 1.0 / (1.0 / u_focalLength - 1.0 / distanceToSubject);
    float blurRadius = abs(u_lensDiameter / 2.0 / distanceToImage * (u_distanceToSensor - distanceToImage));

    // TODO blur

    vec3 outRgb = texture(u_image, vec2(texX, texY)).rgb / v_w + u_bg * (1.0 - 1.0 / v_w);

    outColor = vec4(outRgb, 1);
}
