const startMenu = `
<div class="start" id='start'>
<h1 class="title">Agario</h1>
<hr>
<ul>
    <li>W : Split</li>
    <li>E : Merge</li>
    <li>Left Click : Throw mass</li>
    <li>Noramal agario rules are valid ...</li>
</ul>
<hr>
<input type="text" placeholder="enter your name" maxlength="8" id='name-input' />
<button id="startButton" class="startButton">Play</button>
</div>
`
const endMenu = `
<div class="endMenu">
<h1 class="die">You die</h1>
<hr>
<button id="play-again" class="play-again">Play again</button>
</div>

`



function querySelectCanvas(){
    canvas = document.querySelector('canvas')
    context = canvas.getContext('2d')
    body = document.querySelector('body')
}
function hideCanavs(){
    canvas.style.opacity = 0
}function showCanavas(){
    canvas.style.opacity = 1
}
function adjustCanvasSize(){
    canvas.width = 1920 / cameraRatio;
    canvas.height = 1080 / cameraRatio;
}
function moveCamera(){
    const dx = MAINPLAYER == undefined ? 0 : MAINPLAYER.x / cameraRatio
    const dy = MAINPLAYER == undefined ? 0 : MAINPLAYER.y / cameraRatio

    const marginTop = `${window.innerHeight / 2 - dy}px`
    const marginLeft = `${window.innerWidth / 2 - dx}px`

    canvas.style.marginTop = marginTop
    canvas.style.marginLeft = marginLeft

    // console.log(dy , dx)
}
function makeStartMenu(){
    body.innerHTML += startMenu
}
function removeStartMenu(){
    const element = document.getElementById("start");
    element.remove();
}
function initUI(){
    querySelectCanvas()
    hideCanavs()
    makeStartMenu()

    startButton = document.getElementById("startButton")
    startButton.addEventListener('click' ,()=>handleStartClick())
}
function gameScreen(){
    PLAYERNAME = document.querySelector('#name-input').value
    removeStartMenu()
    querySelectCanvas()

    showCanavas()
    adjustCanvasSize()
    moveCamera()


}
function endGameScreen(){
    body.innerHTML += endMenu
    querySelectCanvas()

    endButton = document.querySelector('#play-again')
    console.log("end game clicked")
    endButton.addEventListener('click', () => goToMainMenu())
}
function drawArc({x,y,radius,color}){
    context.beginPath();
    context.fillStyle = color;
    context.arc(
        x / cameraRatio,
        y / cameraRatio,
        radius / cameraRatio,
      0,
      Math.PI * 2,
      false
    );
    context.fill();
    context.closePath();
}
