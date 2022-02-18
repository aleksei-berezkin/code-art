#version 300 es

precision highp float;

uniform sampler2D u_main;
uniform sampler2D u_attr;
uniform sampler2D u_selfAttr;

uniform vec2 u_attrSizePx;
uniform vec2 u_selfAttrSizePx;

uniform vec2 u_blurRadiiPx;
uniform vec3 u_bg;

in vec2 v_mainPosTx;
in vec2 v_attrPosTx;
in vec2 v_selfAttrPosTx;

out vec4 outColor;

vec3 pluck(float l, vec3 c, float r) {
    float x = max(l, min(r, c.x));
    float y = max(l, min(r, c.y));
    float z = max(l, min(r, c.z));
    return vec3(x, y, z);
}

void main() {
    bool inAttr = 0.0 <= v_attrPosTx.x && v_attrPosTx.x <= 1.0 && 0.0 <= v_attrPosTx.y && v_attrPosTx.y <= 1.0;
    bool inSelfAttr = 0.0 <= v_selfAttrPosTx.x && v_selfAttrPosTx.x <= 1.0 && 0.0 <= v_selfAttrPosTx.y && v_selfAttrPosTx.y <= 1.0;
    

    if (inAttr || inSelfAttr) {
        vec2 attrSizePx = inAttr ? u_attrSizePx : u_selfAttrSizePx;

        vec2 onePixel = vec2(1) / attrSizePx;
        vec3 blur = vec3(0);
        float w = 0.0;
        for (int i = 0; i < _K_SIZE_; i++) {
            for (int j = 0; j < _K_SIZE_; j++) {
                int x = i - (_K_SIZE_ / 2);
                int y = j - (_K_SIZE_ / 2);
                vec2 deltaPx = vec2(x, y) / float(_K_SIZE_ / 2) * u_blurRadiiPx;
                blur += inAttr
                    ? texture(u_attr, v_attrPosTx + onePixel * deltaPx).xyz
                    : texture(u_selfAttr, v_selfAttrPosTx + onePixel * deltaPx).xyz;
                w += 1.0;
            }
        }

        blur /= w;
        vec3 blurInverse = pluck(0.0, 1.0 - pluck(0.0, blur, .1) * 6.0 + u_bg * 2.5, 1.0);

        vec4 aTx = inAttr ? texture(u_attr, v_attrPosTx) : texture(u_selfAttr, v_selfAttrPosTx);
        outColor = texture(u_main, v_mainPosTx) * vec4(blurInverse, 1.0) + aTx * .75;
    } else {
        outColor = texture(u_main, v_mainPosTx);
    }
}
