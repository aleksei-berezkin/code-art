#version 300 es

precision highp float;
precision lowp int;

int MODE_GLOW = 0;
int MODE_BLUR = 1;

uniform int u_mode;

uniform sampler2D u_image;

uniform float[_BLUR_K_SZ_ * _BLUR_K_SZ_] u_blurKernel;
uniform float u_blurKernelWeight;

uniform float u_glowLuminance;
uniform vec3 u_glowColorMul;
uniform float u_fade;

uniform vec3 u_bg;

in vec2 v_texCoords;
in vec2 v_blurTexCoordsRadii;
in float v_w;

out vec4 outColor;

void main() {
    vec3 blurred = vec3(0);
    for (int row = 0; row < _BLUR_K_SZ_; row++) {
        for (int col = 0; col < _BLUR_K_SZ_; col++) {
            float deltaX = -v_blurTexCoordsRadii.x + 2.0 * v_blurTexCoordsRadii.x * float(row) / float(_BLUR_K_SZ_ - 1);
            float deltaY = -v_blurTexCoordsRadii.y + 2.0 * v_blurTexCoordsRadii.y * float(col) / float(_BLUR_K_SZ_ - 1);
            vec2 tc = v_texCoords + vec2(deltaX, deltaY);
            blurred += u_blurKernel[row * _BLUR_K_SZ_ + col] * texture(u_image, tc).rgb;
        }
    }

    blurred = blurred / u_blurKernelWeight;

    if (u_mode == MODE_GLOW) {
        vec3 selfRgb = texture(u_image, v_texCoords).rgb;
    
        outColor = vec4(
            blurred.r * u_glowColorMul.r * u_glowLuminance + selfRgb.r - u_bg.r,
            blurred.g * u_glowColorMul.g * u_glowLuminance + selfRgb.g - u_bg.g,
            blurred.b * u_glowColorMul.b * u_glowLuminance + selfRgb.b - u_bg.b,
            1
        );
        
    } else if (u_mode == MODE_BLUR) {
        // TODO square func; distort color
        float fade = 1.0 + (v_w - 1.0) * 2.0;
        outColor = vec4(blurred / fade + u_bg * (1.0 - 1.0 / fade), 1);
    }

}
