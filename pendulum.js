let express = require("express");
const {Worker, workerData } = require("worker_threads")
const bp = require('body-parser');

// TODO get port from config rather than command line
if (isNaN(process.argv[2])){
    console.log('provided port ' +process.argv[2]+ ' is not a valid port');
    process.exit();
}
const port = parseInt(process.argv[2]);

let app = express();

const pendulumInit = {
            angle: Math.PI/6,
            angularVel: 0,
            mass: 1,
            length: 1,
            maxWind: 4,
            forces: [10,0],    // [gravity, wind] where gravity is only in y dir, and wind is only in x dir
            active: false
};

const pendulum = {
    angle: pendulumInit.angle,
    angularVel: pendulumInit.angularVel,
    mass: pendulumInit.mass,
    length: pendulumInit.length,
    maxWind: pendulumInit.maxWind,
    forces: [pendulumInit.forces[0],pendulumInit.forces[1]],   
    active: pendulumInit.active
}

// Spawn the worker thread which handles the simulation in background without blocking main event thread
const sim = new Worker("./sim.js",{workerData:pendulum})
sim.on("message", data => {
    pendulum.angle = data.angle;
    pendulum.angularVel = data.angularVel;
    pendulum.mass = data.mass;
    pendulum.length = data.length;
    pendulum.maxWind = data.maxWind;
    pendulum.forces = data.forces;
    pendulum.active = data.active;
});
sim.on("error",error => {
    console.log(error);
});

// API setup
app.listen(port, () => {
    console.log("Pendulum running on port " + port);
});
app.use(function (req, res, next){
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

// API routes
app.put("/params", async (req,res,next) =>{
    console.log('Received put on /params:');
    let active = pendulum.active;
    for (const [key, value] of Object.entries(req.body)) {
        if (key in pendulumInit){
            pendulumInit[key] = value;
        }
    }
    sim.postMessage('PAUSE');
    sim.postMessage(pendulumInit);
    if (active){
        sim.postMessage('RESUME');
    }
    res.json({message:'update success'});
});

app.put("/sim", async (req,res,next) =>{
    console.log('received PUT on /sim:');
    console.log(req.body);
    if (req.body.command == 'START'){
        sim.postMessage('RESUME');
    }else if (req.body.command == 'PAUSE'){
        sim.postMessage('PAUSE');
    }else if (req.body.command == 'STOP'){
        sim.postMessage('PAUSE');
        sim.postMessage(pendulumInit);
        // pendulum.angle= pendulumInit.angle;
        // pendulum.angularVel= pendulumInit.angularVel;
        // pendulum.mass= pendulumInit.mass;
        // pendulum.length= pendulumInit.length;
        // pendulum.maxWind= pendulumInit.maxWind;
        // pendulum.forces= [pendulumInit.forces[0],pendulumInit.forces[1]];  
        // pendulum.active= pendulumInit.active;
    }else {
        res.status(422)
        res.json({message:'Missing or improper command'})
    }
});

app.get("/sim", async (req,res,next) =>{
    res.json({
        "angle":pendulum.angle,
        "length":pendulum.length,
        "mass":pendulum.mass,
        "wind":pendulum.forces[1]});
});
