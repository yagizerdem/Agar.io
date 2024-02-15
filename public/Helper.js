function caclRadius({mass}){
    const radius = Math.floor((Math.sqrt(mass / Math.PI)))
    return radius
}
function calcSpeed({mass}){
    const speed = (mass / Math.pow(mass,1.44))*100
    return speed
}
function generateUniqueUUID(){
    return Math.floor(Math.random()*999999)
}

function calcAngle({diffy , diffx}){
    var angle = Math.atan2(Math.abs(diffy) , Math.abs(diffx)) 
    if(diffx < 0 && diffy < 0){
        angle = Math.PI - angle;
    }
    else if(diffx < 0 && diffy > 0){
        angle += Math.PI
    }
    else if(diffx > 0 && diffy >0){
        angle = 2 * Math.PI - angle
    }
    return angle
}

function checkWall({x,y}){
    const expression = (
        x  < 0  ||
        y < 0 ||
        x > 1920 ||
        y > 1080
      )
    return expression
}