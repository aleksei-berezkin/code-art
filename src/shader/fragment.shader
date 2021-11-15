#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our textures
uniform sampler2D u_image0;
uniform sampler2D u_image1;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// Kernel
uniform float u_kernel[_kLen_];
uniform int u_kSize;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    vec2 onePixel = vec2(1) / vec2(textureSize(u_image0, 0));

    int fromPos = (-u_kSize + 1) / 2;

    vec4 resColor = vec4(0);
    float w = 0.0;

    for (int row = 0; row < u_kSize; row++) {
        for (int col = 0; col < u_kSize; col++) {
            float k = u_kernel[row * u_kSize + col];
            vec2 d = vec2(onePixel.x * float(fromPos + col), onePixel.y * float(fromPos + row));

            resColor += k * texture(u_image0, v_texCoord + d);

            w += k;
        }
    }

    outColor = .5 * resColor / w + .5 * texture(u_image1, v_texCoord);
}
