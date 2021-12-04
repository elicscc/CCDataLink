/**
 * 参考 http://www.gizma.com/easing/
 */
export class EasingFunctions {
    linear = (t: number, b: number, c: number, d: number) => {
      return c * t / d + b
    };

    quadraticIn = (t: number, b: number, c: number, d: number) => {
      t /= d
      return c * t * t + b
    };

    quadraticOut = (t: number, b: number, c: number, d: number) => {
      t /= d
      return -c * t * (t - 2) + b
    };

    quadraticInOut = (t: number, b: number, c: number, d: number) => {
      t /= d / 2
      if (t < 1) return c / 2 * t * t + b
      t--
      return -c / 2 * (t * (t - 2) - 1) + b
    };

    cubicIn = (t: number, b: number, c: number, d: number) => {
      t /= d
      return c * t * t * t + b
    };

    cubicOut = (t: number, b: number, c: number, d: number) => {
      t /= d
      t--
      return c * (t * t * t + 1) + b
    };

    cubicInOut = (t: number, b: number, c: number, d: number) => {
      t /= d / 2
      if (t < 1) return c / 2 * t * t * t + b
      t -= 2
      return c / 2 * (t * t * t + 2) + b
    };

    quarticIn = (t: number, b: number, c: number, d: number) => {
      t /= d
      return c * t * t * t * t + b
    };

    quarticOut = (t: number, b: number, c: number, d: number) => {
      t /= d
      t--
      return -c * (t * t * t * t - 1) + b
    };

    quarticInOut = (t: number, b: number, c: number, d: number) => {
      t /= d / 2
      if (t < 1) return c / 2 * t * t * t * t + b
      t -= 2
      return -c / 2 * (t * t * t * t - 2) + b
    };

    quinticIn = (t: number, b: number, c: number, d: number) => {
      t /= d
      return c * t * t * t * t * t + b
    };

    quinticOut = (t: number, b: number, c: number, d: number) => {
      t /= d
      t--
      return c * (t * t * t * t * t + 1) + b
    };

    quinticInOut = (t: number, b: number, c: number, d: number) => {
      t /= d / 2
      if (t < 1) return c / 2 * t * t * t * t * t + b
      t -= 2
      return c / 2 * (t * t * t * t * t + 2) + b
    };

    sinusoidalIn = (t: number, b: any, c: number, d: number) => {
      return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
    };

    sinusoidalOut = (t: number, b: number, c: number, d: number) => {
      return c * Math.sin(t / d * (Math.PI / 2)) + b
    };

    sinusoidalInOut = (t: number, b: number, c: number, d: number) => {
      return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
    };

    exponentialIn = (t: number, b: number, c: number, d: number) => {
      return c * Math.pow(2, 10 * (t / d - 1)) + b
    };

    exponentialOut = (t: number, b: number, c: number, d: number) => {
      return c * (-Math.pow(2, -10 * t / d) + 1) + b
    };

    exponentialInOut = (t: number, b: number, c: number, d: number) => {
      t /= d / 2
      if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b
      t--
      return c / 2 * (-Math.pow(2, -10 * t) + 2) + b
    };

    circularIn = (t: number, b: number, c: number, d: number) => {
      t /= d
      return -c * (Math.sqrt(1 - t * t) - 1) + b
    };

    circularOut = (t: number, b: number, c: number, d: number) => {
      t /= d
      t--
      return c * Math.sqrt(1 - t * t) + b
    };

    circularInOut = (t: number, b: number, c: number, d: number) => {
      t /= d / 2
      if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b
      t -= 2
      return c / 2 * (Math.sqrt(1 - t * t) + 1) + b
    }
}
const easingFunctions = new EasingFunctions()

export class Paths {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static randomOffset (from: number, to: number, steps: number, stepOffset = 1, maxOffset = 4) {
    const endSteps = maxOffset / stepOffset
    const path = [from]
    let cur = from
    const stepOffsets = [-stepOffset, 0, stepOffset]
    for (let i = 1; i < steps; i++) {
      if (i + endSteps >= steps) {
        const newY = cur + (to - cur) / (steps - i)
        if (Math.abs(newY - cur) > maxOffset) {
          cur = newY
        }
      } else {
        cur += stepOffsets[Math.floor(Math.random() * stepOffsets.length)]
      }
      path.push(cur)
    }
    path.push(to)
    return path
  }

  static easing (from: number, to: number, duration: number, steps: number, easing: keyof EasingFunctions) {
    const easingFunction = easingFunctions[easing]
    const path = []
    try {
      let index = 0
      for (let t = 0; t <= duration; t += duration / steps) {
        if (index > 30) {
          break
        }
        const s = easingFunction(t, from, to - from, duration)
        index++
        console.log(index)
        path.push(s)
      }
    } catch (error) {
      console.log(error)
    }
    return path
  }
}

// const res = Paths.easing(0, 100, 1, 30, "quarticInOut");
// res.forEach((item, itemI) => console.log(itemI + "\t" + item));
