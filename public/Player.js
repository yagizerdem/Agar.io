class Player{
    static maxMass = 1000 * 200 // cell base mass * 200
    constructor({name,color,uuid}){
        this.name = name
        this.color = color
        this.uuid = uuid

        // can chagne during run time
        this.allCells = []
        this.totalMass = -1
        this.x =  0
        this.y = 0
    }
    draw(){
        for(var cell of this.allCells){
            cell.draw()
        }
        this.drawCenterPoint()
    }
    drawCenterPoint(){
        drawArc({
            x:this.x,
            y:this.y,
            radius:3,
            color:'white'
        })  
    }
    update(){
        this.totalMass = 0
        for(var cell of this.allCells){
            this.totalMass += cell.mass
        }
        for(var cell of this.allCells){
            cell.update()
        }
        this.totalMass = 0
        for(var cell of this.allCells){
            this.totalMass += cell.mass
        }
        this.calcCenterOfMass()

        var elasticCollideCells = this.checkElasticCollision()
 
        if(elasticCollideCells.length > 0){
            for(var double of elasticCollideCells){

                this.TwoDimentionalElasticCollision(double[0] , double[1])
            }
        }
        this.push()
        this.mergeCells()
    }
    calcCenterOfMass(){
        var mx = 0 , my = 0
        for(var cell of this.allCells){
            mx += cell.mass * cell.x 
            my += cell.mass * cell.y 
        }
        this.x = mx / this.totalMass
        this.y = my / this.totalMass
    }
    checkElasticCollision(){

        var elasticCollideCells = []
        for(var i = 0 ; i < this.allCells.length - 1 ; i++){
            for(var j = i + 1 ; j < this.allCells.length ; j++){
                const cell1 = this.allCells[i]
                const cell2 = this.allCells[j]
                const hypot = Math.hypot(cell1.x - cell2.x , cell1.y - cell2.y)
                if(hypot <= cell1.radius + cell2.radius){
                    elasticCollideCells.push([cell1,cell2])

                }
            }
        }

        return elasticCollideCells
    }

    TwoDimentionalElasticCollision(first , second){
        if(first.splitTimer <= Date.now() || second.splitTimer <= Date.now()) return
        const angle_ = Math.atan2(first.y - second.y,first.x - second.x)

        const u1 = this.rotate([first.speed * Math.cos(-first.angle) , first.speed*Math.sin(-first.angle)] , angle_)
        const u2 = this.rotate([second.speed * Math.cos(-second.angle) , second.speed*Math.sin(-second.angle)] , angle_)

        const v1 = { x: u1[0] * (first.mass - second.mass) / (first.mass + second.mass) + u2[0] * 2 * second.mass / (first.mass +second.mass), y: u1[1] };
        const v2 = { x: u2[0] * (first.mass - second.mass) / (first.mass + second.mass) + u1[0] * 2 * second.mass / (first.mass +second.mass), y: u2[1] };

        const vfinal1 = this.rotate([v1.x , v1.y] , -angle_)
        const vfinal2 = this.rotate([v2.x , v2.y] , -angle_)
        
        if(Math.abs(vfinal1[0]) > Math.abs(first.speed *Math.cos(-first.angle))){
            vfinal1[0] = first.speed *Math.cos(-first.angle)
        }
        if(Math.abs(vfinal1[1]) > Math.abs(first.speed *Math.sin(-first.angle))){
            vfinal1[1] = first.speed *Math.sin(-first.angle)
        }

        if(Math.abs(vfinal2[0]) > Math.abs(second.speed *Math.cos(-second.angle))){
            vfinal2[0] = second.speed *Math.cos(-second.angle)
        }
        if(Math.abs(vfinal2[1]) > Math.abs(second.speed *Math.sin(-second.angle))){
            vfinal2[1] = second.speed *Math.sin(-second.angle)
        }

        first.x += vfinal1[0]
        first.y += vfinal1[1]

        second.x += vfinal2[0]
        second.y += vfinal2[1]
        

        if(checkWall({x:first.x , y:first.y})){
           
            first.x -= vfinal1[0]
            first.y -= vfinal1[1]
        }
        if(checkWall({x:second.x , y:second.y})){
            second.x -= vfinal2[0]
            second.y -= vfinal2[1]
        }

    }
    rotate(velocity, angle) {
        const vx = velocity[0]
        const vy = velocity[1]

        const vfx = Math.cos(-angle)*vx - Math.sin(-angle) * vy
        const vfy = Math.sin(-angle)* vx + Math.cos(-angle) * vy

    
        return [vfx,vfy];
    }
    push(){
        for(var cell1 of this.allCells){
            for(var cell2 of this.allCells){
                if(cell1 == cell2 || cell1.splitTimer <= Date.now() || cell2.splitTimer <= Date.now()) continue
                const diff = Math.hypot(cell1.y - cell2.y , cell1.x - cell2.x)
                if(cell1.mass >= cell2.mass && (diff < cell1.radius + cell2.radius)){
                    // push 
                    const angle = Math.atan(cell1.y - cell2.y , cell1.x - cell2.x)
                    var d = cell1.radius + cell2.radius - diff


                    cell2.x += Math.cos(-angle) * d
                    cell2.y += Math.sin(-angle) *d


                    if(checkWall({x:cell2.x , y:cell2.y})){
           
                        cell2.x -= Math.cos(-angle) * d
                        cell2.y -= Math.sin(-angle) *d
                    }

                }
            }
        }
    }
    mergeCells(){
        for(var i = this.allCells.length -1; i > 0 ; i-- ){
            for(var j = i -1 ; j >= 0;j--){
                var cell1 = this.allCells[j]
                var cell2 = this.allCells[i]
                var diff = Math.hypot(cell1.y - cell2.y , cell1.x - cell2.x)
                
                var expression = (
                    cell1 != cell2 &&
                    cell1.splitTimer <= Date.now() && cell2.splitTimer <= Date.now()
                    && 
                    diff <= ((cell1.radius + cell2.radius)* 2 / 3 )
                    )
                if(expression){
                    // merge
                    cell1.mass += cell2.mass
                    this.allCells.splice(i ,1)
                }
            }
        }

    }
}