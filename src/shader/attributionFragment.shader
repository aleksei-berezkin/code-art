#version 300 es

precision highp float;

uniform sampler2D u_main;
uniform sampler2D u_attr;
uniform vec2 u_attrSizePx;
uniform vec3 u_bg;

in vec2 v_mainPosTx;
in vec2 v_attrPosTx;

out vec4 outColor;

// TODO constants
int k = 15;

vec3 pluck(float l, vec3 c, float r) {
    float x = max(l, min(r, c.x));
    float y = max(l, min(r, c.y));
    float z = max(l, min(r, c.z));
    return vec3(x, y, z);
}

void main() {
    vec4 main = texture(u_main, v_mainPosTx);
    vec4 attr = texture(u_attr, v_attrPosTx);

    if (0.0 <= v_attrPosTx.x && v_attrPosTx.x <= 1.0 && 0.0 <= v_attrPosTx.y && v_attrPosTx.y <= 1.0) {
        vec2 onePixel = vec2(1) / vec2(textureSize(u_attr, 0)) / 2.0;
        vec3 blur = vec3(0);
        float w = 0.0;
        for (int i = -k; i <= k; i++) {
            for (int j = -k; j <= k; j++) {
                if (i * i + j * j < k * k) {
                    blur += texture(u_attr, v_attrPosTx + onePixel * vec2(i, j)).xyz;
                    w += 1.0;
                }
            }
        }

        blur /= w;
        vec3 blurInverse = pluck(0.0, 1.0 - pluck(0.0, blur, .2) * 3.5 + u_bg * 2.5, 1.0);

        outColor = main * vec4(blurInverse, 1.0) + attr;
    } else {
        outColor = 1.0 - (1.0 - main) * (1.0 - attr);
    }
}
