class Dot {
  static mass = 50;
  constructor({ x, y, color, uuid }) {
    (this.x = x),
      (this.y = y),
      (this.color = color),
      (this.radius = caclRadius({ mass: Dot.mass })),
      (this.uuid = uuid);
  }
  draw() {
    drawArc({
      x: this.x,
      y: this.y,
      color: this.color,
      radius: this.radius,
    });
  }
  static createNewDot() {
    const r = caclRadius({ mass: Dot.mass });
    return new Dot({
      x: Math.floor(Math.random() * (1920 - r * 2)) + r,
      y: Math.floor(Math.random() * (1080 - r * 2)) + r,
      color: allColors[Math.floor(Math.random() * allColors.length)],
      uuid: Math.floor(Math.random() * 9999999),
    });
  }
}
