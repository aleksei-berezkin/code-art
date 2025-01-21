#version 300 es

precision highp float;
precision lowp int;

int MODE_GLOW = 0;
int MODE_BLUR = 1;

uniform int u_mode;

uniform int u_glowKSize;
uniform int u_blurKSize;

uniform sampler2D u_image;

uniform vec3 u_glowShiftedColor;
uniform float u_glowColorShift;
uniform float u_glowBrightness;
uniform float u_fade;

uniform vec3 u_fadeNearColor;
uniform vec3 u_fadeFarColor;
uniform float u_fadeRecolor;

uniform vec3 u_bg;

uniform float u_colorBrightness;

in vec2 v_texCoords;
in vec2 v_blurTexCoordsRadii;
in float v_w;

out vec4 outColor;

float kernel(int mode, int row, int col) {
    int kSz = u_mode == MODE_GLOW ? u_glowKSize : u_blurKSize;
    int x = col - kSz / 2;
    int y = row - kSz / 2;
    if (mode == MODE_GLOW) {
        // Gaussian
        float sigma = float(kSz) / 8.0;
        return 1.0 / sigma / sqrt(2.0 * 3.14159265359) * exp(-float(x * x + y * y) / 2.0 / (sigma * sigma));
    }
    if (mode == MODE_BLUR) {
        // Round
        if (x * x + y * y <= (kSz / 2) * (kSz / 2)) {
            return 1.0;
        }
        return 0.0;
    }
    return 0.0;
}

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
    float kWeight = 0.0;
    int kSz = u_mode == MODE_GLOW ? u_glowKSize : u_blurKSize;

    for (int row = 0; row < _LOOP_SZ_; row++) {
        if (row >= kSz) {
            break;
        }
        for (int col = 0; col < _LOOP_SZ_; col++) {
            if (col >= kSz) {
                break;
            }
            vec2 delta = -v_blurTexCoordsRadii + 2.0 * v_blurTexCoordsRadii * vec2(row, col) / float(kSz - 1);
            float k = kernel(u_mode, row, col);
            blurred += k * (texture(u_image, v_texCoords + delta).rgb - u_bg);
            kWeight += k;
        }
    }

    blurred = blurred / kWeight;

    if (u_mode == MODE_GLOW) {
        vec3 selfRgb = texture(u_image, v_texCoords).rgb;
        outColor = vec4(
            ((1.0 - u_glowColorShift) * blurred + u_glowColorShift * avg(blurred) * u_glowShiftedColor) * u_glowBrightness + u_bg
            + selfRgb * u_colorBrightness,
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
                distort = distance * u_fadeRecolor;
                distortColor = u_fadeFarColor;
            } else {
                float brighter = 1.0 + pow(distance, 2.0) / u_fade;
                selfColor = blurred * brighter;
                distort = -distance * u_fadeRecolor;
                distortColor = u_fadeNearColor;
            }

            if (distort == 0.0) {
                outColor = vec4(selfColor, 1);
            } else {
                outColor = vec4((selfColor / distort + avg(selfColor) * distortColor * distort) / (avg(selfColor) * distort + 1.0/distort), 1);
            }
        }
    }

}
