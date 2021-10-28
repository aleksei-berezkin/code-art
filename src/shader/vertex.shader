#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

out vec4 v_color;

uniform vec2 u_resolution;

// all shaders have a main function
void main() {
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to -1->+1 (clip space)
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // Clip space goes -1.0 to +1.0
  // Color space goes from 0.0 to 1.0
  // Less than 0 is black, greater than 1 is white
  float val = (gl_Position[0] + gl_Position[1]) * .5 + .5;
  v_color = vec4(val, val, val, 1);
}
