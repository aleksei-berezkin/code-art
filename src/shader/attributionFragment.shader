#version 300 es

precision highp float;

uniform sampler2D u_main;
uniform sampler2D u_attr;

uniform vec2 u_attrSizePx;
uniform vec2 u_blurRadiiPx;
uniform vec3 u_bg;

in vec2 v_mainPosTx;
in vec2 v_attrPosTx;

out vec4 outColor;

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
        vec2 onePixel = vec2(1) / u_attrSizePx;
        vec3 blur = vec3(0);
        float w = 0.0;
        for (int i = 0; i < _K_SIZE_; i++) {
            for (int j = 0; j < _K_SIZE_; j++) {
                int x = i - (_K_SIZE_ / 2);
                int y = j - (_K_SIZE_ / 2);
                vec2 deltaPx = vec2(x, y) / float(_K_SIZE_ / 2) * u_blurRadiiPx;
                blur += texture(u_attr, v_attrPosTx + onePixel * deltaPx).xyz;
                w += 1.0;
            }
        }

        blur /= w;
        vec3 blurInverse = pluck(0.0, 1.0 - pluck(0.0, blur, .1) * 6.0 + u_bg * 2.5, 1.0);

        outColor = main * vec4(blurInverse, 1.0) + attr * .75;
    } else {
        outColor = main;
    }
}
