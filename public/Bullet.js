class Bullet{
    static baseMass = 500
    static baseAcceleration = 20
    static baseFriction = 0.5
    constructor({x,y,uuid,angle,color}){
        this.x = x
        this.y = y
        this.acceleration = Bullet.baseAcceleration
        this.mass = Bullet.baseMass
        this.uuid = uuid
        this.angle = angle
        this.radius = caclRadius({mass:this.mass})
        this.color = color
    }
    draw(){
        drawArc({
            x:this.x,
            y:this.y,
            radius:this.radius,
            color:this.color
        })
    }
    update(){
        if(this.acceleration <= 0) return
        if(this.checkCollision()){
            // bounce physics
            this.bounce()
            this.move(1)
            this.acceleration -= Bullet.baseFriction*5
        }else{
            this.move(1)
            this.acceleration -= Bullet.baseFriction
        }
    }
    move(coefficient){
        const dx =  Math.cos(-this.angle) *  this.acceleration
        const dy =  Math.sin(-this.angle) * this.acceleration
        this.x += dx * coefficient
        this.y += dy * coefficient
    }
    checkCollision(){
        this.move(1)
        const flag = checkWall({x:this.x +  this.radius * Math.cos(-this.angle) , y:this.y + this.radius* Math.sin(-this.angle)})
        this.move(-1)
        return flag
    }
    bounce(){
        if(this.x +  this.radius * Math.cos(-this.angle) <= 0){
            this.angle =this.angle +  -Math.sign(Math.sin(this.angle)) * Math.PI / 2
        }
        else if(this.x +  this.radius * Math.cos(-this.angle) >= 1920){
            this.angle =this.angle +  Math.sign(Math.sin(this.angle)) * Math.PI / 2
        }
        else if(this.y + this.radius* Math.sin(-this.angle) <= 0){
            this.angle =this.angle  -Math.sign(Math.cos(this.angle))  * Math.PI / 2
        }
        else if(this.y + this.radius* Math.sin(-this.angle) >= 1080){
            this.angle =this.angle + Math.sign(Math.cos(this.angle)) * Math.PI / 2
        }
    }
}