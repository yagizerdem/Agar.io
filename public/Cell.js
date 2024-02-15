class Cell {
  static baseMass = 1000;
  static baseFriction = 0.7;
  static baseAcceleration = 20;
  static baseSplitTimer = 1000 * 10 // 1000 == 1second
  constructor({ x, y, mass, color, name, uuid, angle }) {
    (this.color = color),
      (this.name = name),
      (this.uuid = uuid),
      // can change during runtime
      (this.x = x),
      (this.y = y),
      (this.speed = -1),
      (this.radius = -1),
      (this.angle = angle), // radian
      (this.mass = mass); // initial mass
    this.acceleration = 0;
    this.splitTimer = Date.now() - 99999 // tics

  }
  draw() {
    drawArc({
      x:this.x,
      y:this.y,
      radius:this.radius,
      color:this.color
  }) 

  var fontSize = this.radius  / PLAYERNAME.length * 2
  if(PLAYERNAME.trim() == '') fontSize = this.radius / 2
  context.beginPath()
  context.font = `${fontSize}px Arial`;
  context.fillStyle = "white"; // White color for text
  context.fillText(PLAYERNAME,(this.x - (fontSize * PLAYERNAME.length / 8)) / cameraRatio , (this.y + this.radius / 2)/ cameraRatio  );

  context.closePath()

  context.beginPath()
  // print mass
  const m = Math.floor(this.mass / 100)
  const lenght = (m + '').length
  context.fillText(`${m}`,(this.x - lenght * fontSize / 8) / cameraRatio , (this.y - this.radius / 2)/ cameraRatio);

  context.closePath()
  }
  update() {
    if(justifycenter){
      this.angle = calcAngle({
        diffx:MAINPLAYER.x - this.x,
        diffy:MAINPLAYER.y - this.y
      })
    }
    this.radius = caclRadius({ mass: this.mass });
    this.speed = calcSpeed({ mass: this.mass });
    if(!this.checkBounds() && ! this.checElasticCollision()){
      this.move();
    }else{
      this.acceleration = 0
    }

    this.eat()
    if(this.acceleration > 0){
      this.acceleration -= Cell.baseFriction
    }
    // check virus
    var virusuuid =  this.checkVirus()
    if(virusuuid != null){
      // split
      this.mass = this.mass / 4
      this.acceleration = Cell.baseAcceleration
      this.angle =  Math.floor(Math.random() * 360) * Math.PI / 180
      this.radius = caclRadius({ mass: this.mass });
      this.speed = calcSpeed({ mass: this.mass });
      this.splitTimer = Date.now() + Cell.baseSplitTimer
      // new cells
      for(var i = 0 ;i <3; i++){
        var randomAngle =  Math.floor(Math.random() * 360) * Math.PI / 180
        const newCell = new Cell({
          x:this.x + Math.cos(-randomAngle) *this.radius * 2 + (this.speed * Math.cos(-randomAngle))+0.999 * Math.cos(-randomAngle),
          y:this.y + Math.sin(-randomAngle) * this.radius *2 + (this.speed * Math.sin(-randomAngle))+0.999 * Math.sin(-randomAngle),
          mass:this.mass,
          color:this.color,
          name:this.name,
          uuid:Math.floor(Math.random()*999999),
          angle:randomAngle
        })
        newCell.acceleration= Cell.baseAcceleration
        newCell.splitTimer = Date.now() + Cell.baseSplitTimer
        MAINPLAYER.allCells.push(newCell)
      }
      // remove virus 
      for(var index in ALLVIRUS){
        if(ALLVIRUS[index].uuid === virusuuid){
          ALLVIRUS.splice(index,1)
          break;
        }
      } 
      socket.emit('removevirus',virusuuid)
      virushitcount++
    }
  }
  move() {
    const dx = Math.cos(-this.angle) * (this.speed + this.acceleration);
    const dy = Math.sin(-this.angle) * (this.speed + this.acceleration);
    this.x += dx ;
    this.y += dy ;
  }
  checkVirus(){
    if(this.mass <= Virus.baseMass*1.1) return
    for(var virus of ALLVIRUS){
      const diff = Math.hypot(this.x - virus.x , this.y - virus.y)
      if(diff <= this.radius +  (virus.radius * 2 / 3)){
        return virus.uuid
      }

    }
    return null
  }
  checkBounds() {
    const dx = Math.cos(-this.angle) * (this.speed + this.acceleration);
    const dy = Math.sin(-this.angle) * (this.speed + this.acceleration);
    const flag = checkWall({x:this.x + dx,y:this.y + dy})
    return flag;
  }
  eat(){
    // eat dot
    for (let key in ALLDOT) {
      if (ALLDOT.hasOwnProperty(key)) {
          const dot = ALLDOT[key]
          const diff = Math.hypot(this.x - dot.x , this.y - dot.y)
          if(diff <= this.radius + dot.radius){
            delete ALLDOT[key]
            if(MAINPLAYER.totalMass < Player.maxMass) this.mass += Dot.mass
            dotEatcount++

            socket.emit('eatdot',key)
          } 
      }
    }
    // eat cell
    for(let key in ALLENEMY){
      if(ALLENEMY.hasOwnProperty(key)){
        const enemy = ALLENEMY[key]
        for(var i = enemy.allCells.length-1 ; i >= 0; i--){
          const cell = enemy.allCells[i]
          const diff = Math.hypot(this.x - cell.x , this.y - cell.y)
          if(diff < (this.radius + cell.radius - (cell.radius *2 / 3) ) && this.mass >= cell.mass * (1.1)){
            // eat cell
            if(MAINPLAYER.totalMass < Player.maxMass) this.mass += cell.mass
            socket.emit('cellkilled' ,({playeruuid:enemy.uuid , celluuid:cell.uuid , index:i}))
            // delte cell
            enemy.allCells.splice(i,1)
          }
        }

      }
    }
    // eat bullet
    for(var i = ALLBULLET.length-1 ; i >= 0 ; i--){
      const bullet = ALLBULLET[i]
      const diff = Math.hypot(bullet.x - this.x , bullet.y - this.y)
      if(diff < this.radius + bullet.radius - bullet.radius * 2 / 3){
        if(MAINPLAYER.totalMass < Player.maxMass) this.mass += Bullet.baseMass
        socket.emit('eatbullet',bullet.uuid)
        ALLBULLET.splice(i , 1)
      }
    }

  }
  split(){
    this.mass = this.mass / 2
    this.splitTimer = Date.now()  + Cell.baseSplitTimer
    this.radius = caclRadius({mass:this.mass})
    this.speed = calcSpeed({mass:this.mass})
    const dx = Math.cos(-this.angle) * this.radius * 2 + (this.speed * Math.cos(-this.angle))+0.999 * Math.cos(-this.angle)
    const dy = Math.sin(-this.angle) * this.radius *2  + (this.speed * Math.sin(-this.angle))+0.999 * Math.sin(-this.angle)
    const newCell = new Cell({
      x:this.x + dx,
      y:this.y + dy,
      mass:this.mass,
      color:this.color,
      name:this.name,
      angle:this.angle,
      uuid:Math.floor(Math.random()*9999999)
    })
    newCell.acceleration = Cell.baseAcceleration
    newCell.splitTimer = Date.now()  + Cell.baseSplitTimer
    return newCell
  }
  checElasticCollision(){
    for(var cell of MAINPLAYER.allCells){
      if(cell.uuid == this.uuid || cell.splitTimer <= Date.now() || this.splitTimer <= Date.now()) continue
      const diff = Math.hypot(cell.x - this.x , cell.y - this.y)
      if(diff <= cell.radius + this.radius){
        return true
      }
    }
    return false
  }

}
