const { v4: uuidv4 } = require('uuid');
var express = require('express');
var app = express();
const port = process.env.PORT || 5500
var server = app.listen(port , ()=>{
    console.log(`App started add port : ${port}`)
});
//var server = app.listen(3000);
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);
const allPlayers = {}
var playerCount = 0
var firstPlayeruuidsocketid;

function newConnection(socket){
    socket.on('disconnect' , ()=>{
        if(playerCount > 0) playerCount--
        delete allPlayers[socket.id]
        io.emit('removeenemy',socket.id)
        if(playerCount > 0){
            const socketid_ = Object.keys(allPlayers)[0]
            firstPlayeruuidsocketid = socketid_
        }else{
            firstPlayeruuidsocketid = undefined
        }
    })
    socket.on('joinroom',(newPlayer)=>{
        allPlayers[socket.id] = newPlayer
        playerCount++;
        if(playerCount == 1){
            firstPlayeruuidsocketid = socket.id
            io.to(firstPlayeruuidsocketid).emit('initdots')
            io.to(firstPlayeruuidsocketid).emit('initvirus')
        }else{
            io.to(firstPlayeruuidsocketid).emit('fetchdots',socket.id)
        }
        io.emit('newenemy',newPlayer)
    })
    socket.on('requestenemy',()=>{
        io.to(socket.id).emit('requestenemy',allPlayers)
    })
    socket.on('playerdata',(player)=>{
        io.emit('playerdata',player)
    })
    socket.on('fetchdots',({alldots,socketid})=>{
        io.to(socketid).emit('recivedots',alldots)
    })
    socket.on('eatdot',(uuid)=>{
        io.emit('eatdot',uuid)
    })
    socket.on('newdot',(newdot)=>{
        io.emit('newdot',newdot)
    })
    socket.on('cellkilled',( {playeruuid, celluuid,index})=>{
        io.emit('cellkilled',{playeruuid, celluuid,index})
    })
    socket.on('playerkilled',(uuid)=>{
        io.emit('playerkilled',uuid)
    })
    socket.on('newbullet',(newbullet)=>{
        io.emit('newbullet' , newbullet)
    })
    socket.on('eatbullet',(uuid)=>{
        io.emit('eatbullet',uuid)
    })
    socket.on('requestBullet',()=>{
        if(playerCount > 1){
            io.to(firstPlayeruuidsocketid).emit('fetchbullets',socket.id)
        }
    })
    socket.on('requestvirus',()=>{
        if(playerCount > 1){
            io.to(firstPlayeruuidsocketid).emit('fetchvirus',socket.id)
        }
    })
    socket.on('fetchbullets',({allbullet,socketid})=>{
        socket.to(socketid).emit('recivebullets',allbullet)
    })
    socket.on('fetchvirus',({allvirus,socketid})=>{
        socket.to(socketid).emit('recivevirus',allvirus)
    })
    socket.on('removevirus',(uuid)=>{
        io.emit('removevirus',uuid)
    })
    socket.on('newvirus',(virus)=>{
        io.emit('newvirus',virus)
    })
}
