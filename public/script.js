window.onload = () => {
  initUI();
};
function handleStartClick() {
  // socket.emit("joinroom")
  gameScreen();

  // create player
  MAINPLAYER = new Player({
    color: allColors[Math.floor(Math.random() * allColors.length)],
    name: PLAYERNAME,
    uuid: socket.id,
  });
  // initial cell
  const initialCell = new Cell({
    x: Math.floor(Math.random()*1500) + 150,
    y: Math.floor(Math.random()*750) + 150,
    name: PLAYERNAME,
    uuid: generateUniqueUUID(),
    color: MAINPLAYER.color,
    mass: Cell.baseMass,
    angle: 0, // radian
  });
  // const initialCell2 = new Cell({
  //     x:300,
  //     y:300,
  //     name:PLAYERNAME,
  //     uuid : generateUniqueUUID(),
  //     color:MAINPLAYER.color,
  //     mass:Cell.baseMass,
  //     angle:0 // radian
  // })
  // MAINPLAYER.allCells.push(initialCell2)
  MAINPLAYER.allCells.push(initialCell);

  // server
  socket.emit("joinroom", MAINPLAYER);
  socket.emit("requestenemy");
  socket.emit("requestBullet")
  socket.emit("requestvirus")

  addEventListeners();
  // start game
  Server();
  game();
}

function game() {
  gameLoop = setInterval(animate, 1000 / fps);
  massLoosInterval = setInterval(lossMass , 1000 / fps)
}

function draw() {
  drawAllDots();
  drawEnemy();
  drawAllBullet()
  MAINPLAYER.draw();
  drawVirus()
}
function drawEnemy() {
  for (let key in ALLENEMY) {
    if (ALLENEMY.hasOwnProperty(key)) {
      for (var cell of ALLENEMY[key].allCells) {
        drawArc({
          x: cell.x,
          y: cell.y,
          radius: cell.radius,
          color: cell.color,
        });
        const fontSize = cell.radius  / ALLENEMY[key].name.length * 2
        context.beginPath()
        context.font = `${fontSize}px Arial`;
        context.fillStyle = "white"; // White color for text
        context.fillText(ALLENEMY[key].name,(cell.x - (fontSize * ALLENEMY[key].name.length / 8)) / cameraRatio , (cell.y + cell.radius / 2)/ cameraRatio  );
      }
    }
  }
}
function drawAllDots() {
  for (let key in ALLDOT) {
    if (ALLDOT.hasOwnProperty(key)) {
      const dot = ALLDOT[key]
        drawArc({
        x: dot.x,
        y: dot.y,
        radius: dot.radius,
        color: dot.color,
      });
    }
  }
}
function drawAllBullet(){
  for(var bullet of ALLBULLET){
    bullet.draw()
  }
}
function drawVirus()
{
  for(var virus of ALLVIRUS){
    virus.draw()
  }
}
function update() {
  MAINPLAYER.update();
  updateAllBullet()
  adjustCanvasSize();
  moveCamera();
  createNewDots()
  socket.emit("playerdata", MAINPLAYER);
  
  createNewVirus()

  dotEatcount = 0
  virushitcount = 0

  if(checkGameEnd() && !isGameEnded){
    socket.emit("playerkilled" , MAINPLAYER.uuid)
    isGameEnded = true
    endGameScreen()
  }
  adjustCameraRatio()
}
function createNewVirus(){
  for(var i = 0 ; i < virushitcount ; i++){
    var virus;
    // create new virus
    while(true){
      var flag = true
      var randomx = Math.floor(Math.random() * 1700) + 100
      var randomy = Math.floor(Math.random() * 900) + 100
      virus = new Virus({
        x:randomx,
        y:randomy,
        uuid:Math.floor(Math.random()*999999)
      })
      var allCellsinArena = []
      for(var key in ALLENEMY){
        if(ALLENEMY.hasOwnProperty(key)){
          allCellsinArena = [allCellsinArena , ...ALLENEMY[key].allCells]
        }
      }
      allCellsinArena = [...allCellsinArena , ...MAINPLAYER.allCells]
      for(var cell of allCellsinArena){
        const hypot = Math.hypot(virus.x - cell.x , virus.y-cell.y)
        if(hypot < cell.radius + virus.radius + 20){
          flag = false
          break
        }
      }
      if(flag) break
    }
    //
    ALLVIRUS.push(virus)
    socket.emit('newvirus',virus)
  }
}
function updateAllBullet(){
  for(var bullet of ALLBULLET){
    bullet.update()
  }
}
function animate() {
  update();
  draw();
}
function Shoot(e){
  if(isGameStart == true || isGameEnded == true){
    isGameStart = false
    return
  } 
  // shoot
  for(var cell of MAINPLAYER.allCells){
    if(cell.mass <= Cell.baseMass) continue
    if(checkWall({
      x:cell.x + cell.radius * Math.cos(-cell.angle),
      y:cell.y + cell.radius * Math.sin(-cell.angle)
    })){
      continue
    }

    const cx = cell.x + Math.cos(-cell.angle) * (cell.radius + caclRadius({mass:Bullet.baseMass})+0.99999)
    const cy = cell.y + Math.sin(-cell.angle) * (cell.radius + caclRadius({mass:Bullet.baseMass})+0.99999) 
    const newBullet = new Bullet({
        x:cx,
        y:cy,
        uuid:Math.floor(Math.random()*999999),
        angle:cell.angle,
        color:cell.color
    })
    cell.mass -= newBullet.mass
    ALLBULLET.push(newBullet)
    socket.emit('newbullet',newBullet )
  }
}
function addEventListeners() {
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left;
    const cy = rect.top;

    const x = cx + MAINPLAYER.x / cameraRatio;
    const y = cy + MAINPLAYER.y / cameraRatio;

    const diffx = e.clientX - x;
    const diffy = e.clientY - y;

    const angle = calcAngle({ diffy, diffx });

    for (var cell of MAINPLAYER.allCells) {
      cell.angle = angle;
    }
  });
  window.addEventListener("click",(e)=>{
    Shoot(e)
  })
  window.addEventListener('keydown' , ({key,code})=>{
    if(code === "KeyW"){
      // split
      if(MAINPLAYER.allCells.length >=8) return 
      const splitedCells = []
      for(var cell of MAINPLAYER.allCells){
        if(cell.mass <= Cell.baseMass) continue
            // contorl
    var bounds = [
      [cell.x , cell.y - cell.radius], //top
      [cell.x , cell.y + cell.radius], // bottom
      [cell.x + cell.radius , cell.y], // left
      [cell.x - cell.radius , cell.y] // right
    ]
    var flag = false
    for(var bound of bounds){
      if(checkWall({
        x:bound[0],
        y:bound[1]
      })){
        flag = true
        break
      }
    }
    if(flag) continue
        splitedCells.push(cell.split())
      }
      MAINPLAYER.allCells = [...MAINPLAYER.allCells , ...splitedCells]
    }
    if(code === "KeyE" && justifycenter== false){
      justifycenter = true
    }
  })
  window.addEventListener('keyup',({key,code})=>{
    if(code === "KeyE"){
      justifycenter = false
    } 
  })
}
function InitializeDots() {
  for (var i = 0; i < 1000; i++) {
    const newDot = Dot.createNewDot();
    ALLDOT[newDot.uuid] = newDot;
  }
}
function InitializeVirus(){
  for(var i = 0 ; i < 10 ; i++){
    var randomx = Math.floor(Math.random() * 1700) + 100
    var randomy = Math.floor(Math.random() * 900) + 100
    const virus = new Virus({
      x:randomx,
      y:randomy,
      uuid:Math.floor(Math.random()*999999)
    })
    ALLVIRUS.push(virus)

  }
}
function createNewDots(){
    for(var i = 0 ; i < dotEatcount; i++){
        const newDot = Dot.createNewDot()
        ALLDOT[newDot.uuid] = newDot
        socket.emit('newdot',(newDot))
    }
}

function lossMass(){
  for(var cell of MAINPLAYER.allCells){
    cell.mass -= cell.mass * 0.0001
  }
}

function checkGameEnd(){
   if(MAINPLAYER.allCells.length == 0) return true
   return false 
}
function goToMainMenu(){
  clearInterval(gameLoop)
  clearInterval(massLoosInterval)

  location.reload()
}
function Server() {
  socket.on("requestenemy", (allPlyers) => {
    for (let key in allPlyers) {
      if (allPlyers.hasOwnProperty(key)) {
        if (MAINPLAYER.uuid == key) continue;
        ALLENEMY[key] = allPlyers[key];
      }
    }
  });
  socket.on("newenemy", (enemy) => {
    if (enemy.uuid == MAINPLAYER.uuid) return;
    ALLENEMY[enemy.uuid] = enemy;
  });
  socket.on("playerdata", (playerdata) => {
    if (ALLENEMY[playerdata.uuid] != undefined) {
      ALLENEMY[playerdata.uuid] = playerdata;
    }
  });
  socket.on('initdots',()=>{
    InitializeDots()
  })
  socket.on('initvirus',()=>{
    InitializeVirus()
  })
  socket.on('removeenemy',(uuid)=>{
    delete ALLENEMY[uuid]
  })
  socket.on('fetchdots',(socketid)=>{
    socket.emit('fetchdots',{alldots : ALLDOT,socketid:socketid})
  })
  socket.on('recivedots',(alldots)=>{
    ALLDOT = alldots
  })
  socket.on('eatdot',(uuid)=>{
    delete ALLDOT[uuid]
  })
  socket.on('newdot',(newdot)=>{
    if(ALLDOT[newdot.uuid] == undefined){
        ALLDOT[newdot.uuid] = newdot    
    }
  })    
  socket.on('cellkilled',({playeruuid, celluuid,index})=>{
    if(playeruuid == MAINPLAYER.uuid){
        MAINPLAYER.allCells.splice(index,1)
    }
    else{
        ALLENEMY[playeruuid].allCells.splice(index,1)
    }
  })
  socket.on('playerkilled',(uuid)=>{
    delete ALLENEMY[uuid]
  })
  socket.on('newbullet',(newbullet)=>{
    if(!ALLBULLET.map((item) => item.uuid).includes(newbullet.uuid)){
      const newBullet_ = new Bullet({
        x:newbullet.x,
        y:newbullet.y,
        angle:newbullet.angle,
        color:newbullet.color
      })
      newBullet_.uuid = newbullet.uuid
      ALLBULLET.push(newBullet_)
    }
  })
  socket.on('eatbullet',(uuid)=>{
    ALLBULLET = ALLBULLET.filter((item)=>{
      return item.uuid != uuid
    })
  })
  socket.on('fetchbullets',(socketid)=>{
    socket.emit('fetchbullets',{allbullet:ALLBULLET,socketid:socketid})
  })
  socket.on('recivebullets',(bullets)=>{
    for(var bullet of bullets){
      const newBullet = new Bullet({
        x:bullet.x,
        y:bullet.y,
        color:bullet.color,
        angle:bullet.angle,
        uuid:bullet.uuid
      })
      newBullet.acceleration = bullet.acceleration
      ALLBULLET.push(newBullet)
    }
  })
  socket.on('fetchvirus',(socketid)=>{
    socket.emit('fetchvirus',{allvirus:ALLVIRUS,socketid:socketid})
  })
  socket.on('recivevirus',(allvirus)=>{
    for(var virus of allvirus){
      ALLVIRUS.push(new Virus({
        x:virus.x,
        y:virus.y,
        uuid:virus.uuid
      }))
    }
  })
  socket.on('removevirus',(virusuuid)=>{
    for(var index in ALLVIRUS){
      if(ALLVIRUS[index].uuid == virusuuid){
        ALLVIRUS.splice(index,1)
        break;
      }
    }
  })
  socket.on('newvirus',(virus)=>{
    const virus_ = new Virus({
      x:virus.x,
      y:virus.y,
      uuid:virus.uuid
    })
    ALLVIRUS.push(virus_)
  })
}

function adjustCameraRatio(){
  if(MAINPLAYER.totalMass < Cell.baseMass *5){
    cameraRatio = 0.3
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass *10){
    cameraRatio = 0.5
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass *20){
    cameraRatio = 0.6
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass *40){
    cameraRatio = 0.7
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass *50){
    cameraRatio = 0.8
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass *70){
    cameraRatio = 0.9
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass *100){
    cameraRatio = 1
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass * 150){
    cameraRatio = 1.1
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass * 180){
    cameraRatio = 1.2
  }
  else if(MAINPLAYER.totalMass < Cell.baseMass * 190){
    cameraRatio = 1.5
  }
  else {
    cameraRatio = 1.5
  }
}
