const { Console } = require('console');
const { report } = require('process');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const timestep = 0.1;
const pendulum = workerData;
// pendulum.active = true;
parentPort.on("message",data =>{
    if (typeof(data) === 'object'){
        pendulum.angle = data.angle;
        pendulum.angularVel = data.angularVel;
        pendulum.mass = data.mass;
        pendulum.length = data.length;
        pendulum.maxWind = data.maxWind;
        pendulum.forces = data.forces;
        pendulum.active = data.active;
    } else if (typeof(data) === 'string'){
        if(data == 'PAUSE'){
            console.log('Pausing sim');
            pendulum.active = false;
        } else if(data == 'RESUME'){
            console.log('Resuming sim');
            pendulum.active = true;
            loop();
        }
    }
});
loop();

async function loop() {
    while(true === pendulum.active){
        changeWindSpeed();
        step();
        parentPort.postMessage(pendulum);
        await new Promise(r => setTimeout(r, Math.round(timestep*1000))); // Sleep timestep
    }
}

function changeWindSpeed(){
    pendulum.forces[1] = Math.min(Math.max((-1*pendulum.maxWind), pendulum.forces[1]+(Math.random() - 0.5)/5.0), pendulum.maxWind);
}

function step() {
    accelGrav = (-1 * pendulum.forces[0] * Math.sin(pendulum.angle))/pendulum.length;
    accelWind = (pendulum.forces[1] * Math.cos(pendulum.angle))/(pendulum.mass * pendulum.length);
    pendulum.angularVel += (accelGrav + accelWind) * timestep;
    pendulum.angle += pendulum.angularVel * timestep;
    // console.log('angle: ' + pendulum.angle + '\twind speed: ' + pendulum.forces[1]);
}