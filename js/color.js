/*
function makeColorMap(b,w,h) {
   var imgData = image.getContext("2d").getImageData(0,0,w,h);

   var index = 0;

   var sat = 0.0;
   var bri = 0.0;
   var hue = (b - Math.floor(b)) * 360;

   var x,y;

   for ( y = 0; y < h; y++ ) {
      bri = 1 - y / h;

      for(x = 0; x < w; x++) {
         sat = x / w;

         var rgb = COLOR_SPACE.hsv2rgb(hue, sat * 255, bri * 255);

         imgData.data[index++]  = rgb.r;
         imgData.data[index++]  = rgb.g;
         imgData.data[index++]  = rgb.b;
         imgData.data[index++]  = 255;
      }
   }

   return imgData;
}
*/

function rgbToColorXY(rgb,w,h) {
   var hsv = rgb2hsv(rgb);

   var hue = (hsv.h / 360) * w;

   var x = hue;
   var y = (hsv.v / 255) * h;

   return { x:x, y:y };
}

function xyToRgb(x,y,w,h) {
   var hue;
   var sat = 1;
   var bri = 1 - y / h;

   hue = x / w;
   hue = (hue - Math.floor(hue)) * 360;

   return hsv2rgb(hue, sat * 255, bri * 255);
}

function makeHueMap(image,w,h) {
   var imgData = image.getContext("2d").getImageData(0,0,w,h);

   var index = 0;
   var x, y;

   for (y = h - 1; y >= 0; y--) {
      for (x = 0; x < w; x++) {
         var rgb = xyToRgb(x,y,w,h);

         imgData.data[index++] = rgb.r;
         imgData.data[index++] = rgb.g;
         imgData.data[index++] = rgb.b;

         imgData.data[index++] = 255;
      }
   }

   return imgData;
}

function rgb2hsv() {
   var r, g, b, h, s, v, min, delta;

   if (arguments.length === 1) {
      r = arguments[0].r;
      g = arguments[0].g;
      b = arguments[0].b;
   } else {
      r = arguments[0];
      g = arguments[1];
      b = arguments[2];
   }

   if (r > g) {
      v = Math.max(r, b);
      min = Math.min(g, b);
   } else {
      v = Math.max(g, b);
      min = Math.min(r, b);
   }

   delta = v - min;

   if (v == 0.0) {
      s = 0.0;
   } else {
      s = delta / v;
   }

   if (s == 0.0) {
      h = 0.0;
   } else {
      if (r == v) {
         h = 60.0 * (g - b) / delta;
      } else if (g == v) {
         h = 120 + 60.0 * (b - r) / delta;
      } else {
         h = 240 + 60.0 * (r - g) / delta;
      }

      if (h < 0.0)  {
         h += 360.0;
      }

      if (h > 360.0) {
         h -= 360.0;
      }
   }

   h = Math.round (h);
   s = Math.round (s * 255.0);
   v = Math.round (v);

   /* avoid the ambiguity of returning different values for the same color */
   if (h == 360) {
      h = 0;
   }

   return { h:h, s:s, v:v };
};

function hsv2rgb() {
   if (arguments.length === 1) {
      hue = arguments[0].h;
      saturation = arguments[0].s;
      value = arguments[0].v;
   } else {
      hue = arguments[0];
      saturation = arguments[1];
      value = arguments[2];
   }

   var h, s, v, h_temp;
   var f, p, q, t;
   var i;

   if (saturation === 0) {
      hue = value;
      saturation = value;
      value = value;
   } else {
      h = hue;
      s = saturation / 255.0;
      v = value / 255.0;

      if (h == 360) {
         h_temp = 0;
      } else {
         h_temp = h / 60;
      }

      i = Math.floor(h_temp);
      f = h_temp - i;
      vs = v * s;
      p  = value - value * s;

      switch (i){
        case 0:
          t  = v - vs * (1-f);
          hue        = Math.round (value);
          saturation = Math.round (t * 255.0);
          value      = Math.round (p);
          break;

        case 1:
          q  = v - vs * f;
          hue        = Math.round (q * 255.0);
          saturation = Math.round (value);
          value      = Math.round (p);
          break;

        case 2:
          t  = v - vs * (1-f);
          hue        = Math.round (p);
          saturation = Math.round (value);
          value      = Math.round (t * 255.0);
          break;

        case 3:
          q  = v - vs * f;
          hue        = Math.round (p);
          saturation = Math.round (q * 255.0);
          value      = Math.round (value);
          break;

        case 4:
          t  = v - vs * (1-f);
          hue        = Math.round (t * 255.0);
          saturation = Math.round (p);
          value      = Math.round (value);
          break;

        case 5:
          q  = v - vs * f;
          hue        = Math.round (value);
          saturation = Math.round (p);
          value      = Math.round (q * 255.0);
          break;
      }
   }

   return {r:hue,g:saturation,b:value};
}
