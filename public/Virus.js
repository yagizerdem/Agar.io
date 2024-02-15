class Virus{
    static baseMass = 5000
    constructor({x,y,uuid}){
        this.x = x
        this.y = y
        this.mass = Virus.baseMass
        this.radius = caclRadius({mass:this.mass})
        this.color='green',
        this.uuid = uuid
    }
    draw(){
        context.beginPath();
        context.arc(this.x / cameraRatio, this.y / cameraRatio, this.radius / cameraRatio, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        
        // Draw the spikes
        context.beginPath();
        for(let i = 0; i < 16; i++) {
            let angle = Math.PI / 8 * i;
            let spikeX = this.x + Math.cos(angle) * (this.radius + 5);
            let spikeY = this.y + Math.sin(angle) * (this.radius + 5);
            context.moveTo(this.x / cameraRatio, this.y / cameraRatio);
            context.lineTo(spikeX / cameraRatio, spikeY / cameraRatio);
        }
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
    }
}