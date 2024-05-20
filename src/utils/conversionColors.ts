export function rgbToXyz(rgb: [number, number, number]) {
  let r = rgb[0] / 255
  let g = rgb[1] / 255
  let b = rgb[2] / 255

  if (r > 0.04045) {
    r = Math.pow(((r + 0.055) / 1.055), 2.4)
  } else {
    r = r / 12.92
  }

  if (g > 0.04045) {
    g = Math.pow(((g + 0.055) / 1.055), 2.4)
  } else {
    g = g / 12.92
  }

  if (b > 0.04045) {
    b = Math.pow(((b + 0.055) / 1.055), 2.4)
  } else {
    b = b / 12.92
  }

  r *= 100
  g *= 100
  b *= 100

  // Observer = 2°, Illuminant = D65
  const x = Math.round(r * 0.4124 + g * 0.3576 + b * 0.1805)
  const y = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722)
  const z = Math.round(r * 0.0193 + g * 0.1192 + b * 0.9505)

  return [x, y, z]
}

export function rgbToLab(rgb: [number, number, number]) {
  const xyz = rgbToXyz(rgb);

  // Observer = 2°, Illuminant = D65
  let x = xyz[0] / 95.047
  let y = xyz[1] / 100.000
  let z = xyz[2] / 108.883

  if (x > 0.008856) {
    x = Math.pow(x, 0.333333333)
  } else {
    x = 7.787 * x + 0.137931034
  }

  if (y > 0.008856) {
    y = Math.pow(y, 0.333333333)
  } else {
    y = 7.787 * y + 0.137931034
  }

  if (z > 0.008856) {
    z = Math.pow(z, 0.333333333)
  } else {
    z = 7.787 * z + 0.137931034
  }

  const l = Math.round((116 * y) - 16)
  const a = Math.round(500 * (x - y))
  const b = Math.round(200 * (y - z))

  return [l, a, b]
}

export function contrastCalc(color1: [number, number, number], color2: [number, number, number]){
  const li1 = (0.299 * color1[0] + 0.587 * color1[1] + 0.114 * color1[2] ) + 0.05
  const li2 = (0.299 * color2[0] + 0.587 * color2[1] + 0.114 * color2[2] ) + 0.05
  let k = 0;
  if (li1 && li2){
      if (li1 >= li2) {
          k = li1 / li2
      } 
      else {
          k = li2 / li1
      }
    }
  const contrastScale = k.toFixed(2);
  let isContrast = false;
  if (k >= 4.5) {
      isContrast = true
  }
  return {
    scale: contrastScale,
    isContrast: isContrast,
  }
}
