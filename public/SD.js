var canvas
var context
var cameraRatio = 0.3 // init
var MAINPLAYER;
var ALLENEMY = {}
var ALLDOT = {}
var ALLBULLET = []
var ALLVIRUS = []

var startButton;
var endButton;
var isGameEnded = false
var isGameStart = true
var body ;
var PLAYERNAME;

var justifycenter = false
const fps = 50
var gameLoop;
const allColors = ['red','pink','green','purple','blue','orange']

var dotEatcount = 0
var virushitcount = 0

var massLoosInterval ;