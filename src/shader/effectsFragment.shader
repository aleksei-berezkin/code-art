#version 300 es

precision highp float;

in vec2 v_texCoords;
in vec2 v_blurTexCoordsRadii;
in float v_w;

uniform sampler2D u_image;
uniform vec3 u_bg;
uniform float[_BLUR_K_SZ_ * _BLUR_K_SZ_] u_blurKernel;
uniform float u_blurKernelWeight;

out vec4 outColor;

void main() {
    float fade = 1.0 + (v_w - 1.0) / 2.0;
    vec3 outRgb = vec3(0);
    for (int row = 0; row < _BLUR_K_SZ_; row++) {
        for (int col = 0; col < _BLUR_K_SZ_; col++) {
            float deltaX = -v_blurTexCoordsRadii.x + 2.0 * v_blurTexCoordsRadii.x * float(row) / float(_BLUR_K_SZ_ - 1);
            float deltaY = -v_blurTexCoordsRadii.y + 2.0 * v_blurTexCoordsRadii.y * float(col) / float(_BLUR_K_SZ_ - 1);
            vec2 tc = v_texCoords + vec2(deltaX, deltaY);
            outRgb += u_blurKernel[row * _BLUR_K_SZ_ + col]
                * (texture(u_image, tc).rgb / fade + u_bg * (1.0 - 1.0 / fade));
        }
    }

    outColor = vec4(outRgb / u_blurKernelWeight, 1);
}
