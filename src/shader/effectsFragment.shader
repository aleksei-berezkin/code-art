#version 300 es

precision highp float;
precision lowp int;

int MODE_GLOW = 0;
int MODE_BLUR = 1;

uniform int u_mode;

uniform sampler2D u_image;

uniform float[_BLUR_K_SZ_ * _BLUR_K_SZ_] u_blurKernel;
uniform float u_blurKernelWeight;

uniform vec3 u_glowShiftedColor;
uniform float u_glowColorShift;
uniform float u_glowAmplification;
uniform float u_fade;

uniform vec3 u_fadeInDistortion;
uniform vec3 u_fadeOutDistortion;
uniform float u_fadeDistortion;

uniform vec3 u_bg;

uniform float u_colorAmplification;

in vec2 v_texCoords;
in vec2 v_blurTexCoordsRadii;
in float v_w;

out vec4 outColor;

float screen(float a, float b) {
    return 1.0 - (1.0 - a) * (1.0 - b);
}

vec3 screen(vec3 a, vec3 b) {
    return 1.0 - (1.0 - a) * (1.0 - b);
}

float avg(vec3 a) {
    return (a.x + a.y + a.z) / 3.0;
}

void main() {
    vec3 blurred = vec3(0);
    for (int row = 0; row < _BLUR_K_SZ_; row++) {
        for (int col = 0; col < _BLUR_K_SZ_; col++) {
            float deltaX = -v_blurTexCoordsRadii.x + 2.0 * v_blurTexCoordsRadii.x * float(row) / float(_BLUR_K_SZ_ - 1);
            float deltaY = -v_blurTexCoordsRadii.y + 2.0 * v_blurTexCoordsRadii.y * float(col) / float(_BLUR_K_SZ_ - 1);
            vec2 tc = v_texCoords + vec2(deltaX, deltaY);
            blurred += u_blurKernel[row * _BLUR_K_SZ_ + col] * abs(texture(u_image, tc).rgb - u_bg);
        }
    }

    blurred = blurred / u_blurKernelWeight;

    if (u_mode == MODE_GLOW) {
        vec3 selfRgb = texture(u_image, v_texCoords).rgb;
        outColor = vec4(
            ((1.0 - u_glowColorShift) * blurred + u_glowColorShift * avg(blurred) * u_glowShiftedColor) * u_glowAmplification + u_bg
            + selfRgb * u_colorAmplification,
            1
        );
    } else if (u_mode == MODE_BLUR) {
        blurred += u_bg;
        float distance = v_w - 1.0;
        if (distance == 0.0) {
            outColor = vec4(blurred, 1);
        } else {
            vec3 selfColor;
            float distort;
            vec3 distortColor;
            if (distance > 0.0) {
                float fade = 1.0 + pow(distance, 2.0) * u_fade;
                selfColor = blurred / fade;
                distort = distance * u_fadeDistortion;
                distortColor = u_fadeOutDistortion;
            } else {
                float brighter = 1.0 + pow(distance, 2.0) / u_fade;
                selfColor = blurred * brighter;
                distort = -distance * u_fadeDistortion;
                distortColor = u_fadeInDistortion;
            }

            if (distort == 0.0) {
                outColor = vec4(selfColor, 1);
            } else {
                outColor = vec4((selfColor / distort + avg(selfColor) * distortColor * distort) / (avg(selfColor) * distort + 1.0/distort), 1);
            }
        }
    }

}
