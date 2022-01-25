const baseURL = "http://127.0.0.1";
const timeStep = 100;
const pollStep = 100;
const size = 50; 
let scaleFactor = 300;
const colors = ['red', 'green', 'blue', 'gold', 'cyan'];
const pPorts = [8080, 8081, 8082, 8083, 8084];
let pendulums = []

window.addEventListener("load", () =>{
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    for(let i = 0; i < pPorts.length; i++){
        pendulums.push({
            angle:0,
            length:1,
            mass:1,
            wind:0,
            color: colors[i],
            port: pPorts[i],
            xOffFact: (i+1)/6,
            polling: false
        })
    }

    // Poll the pendulums
    let sleep = time => new Promise(resolve => setTimeout(resolve, time));
    let poll = (promiseFn, time) => promiseFn().then(
             sleep(time).then(() => poll(promiseFn, time)));
    poll(() => new Promise(() => {
        pendulums.forEach(p => {
            if(p.polling){
                const xhr = new XMLHttpRequest();
                xhr.open('GET', baseURL+':'+p.port+'/sim', true);
                xhr.responseType = "json"
                xhr.onload = () => {
                    // console.log(xhr.response);
                    p.angle = xhr.response['angle'];
                    p.length = xhr.response['length'];
                    p.mass = xhr.response['mass'];
                    p.wind = xhr.response['wind'];
                };
                xhr.send();
            }
        });
    }), timeStep);

    // Refresh the canvas
    let refreshCanvas = (promiseFn, time) => promiseFn().then(
             sleep(time).then(() => refreshCanvas(promiseFn, time)));
    refreshCanvas(() => new Promise(() => {
        draw()
    }), timeStep);

    window.addEventListener('resize',() =>{
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        draw();
    });

    async function draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pendulums.forEach(p => {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.moveTo(canvas.width*p.xOffFact, 0);
            x =  (canvas.width*p.xOffFact)+ scaleFactor * p.length * Math.sin(p.angle)
            y = scaleFactor * p.length * Math.cos(p.angle)
            ctx.lineTo(x, y);
            ctx.stroke();

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.lineWidth = 5
            ctx.stroke()
            ctx.fill();

            ctx.font = '15pt Calibri';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(p.mass, x, y);

            ctx.fillText(Math.abs(Math.round(p.wind * 100)/100), canvas.width*p.xOffFact, 3*canvas.height/4);
            if (p.wind > 0){
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.moveTo(25+canvas.width*p.xOffFact, 5 + 3*canvas.height/4);
                ctx.lineTo(35+canvas.width*p.xOffFact, -5 + 3*canvas.height/4);
                ctx.lineTo(25+canvas.width*p.xOffFact, -15 + 3*canvas.height/4);
                ctx.stroke();
            } else if (p.wind < 0){
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.moveTo(-25+canvas.width*p.xOffFact, 5 + 3*canvas.height/4);
                ctx.lineTo(-35+canvas.width*p.xOffFact, -5 + 3*canvas.height/4);
                ctx.lineTo(-25+canvas.width*p.xOffFact, -15 + 3*canvas.height/4);
                ctx.stroke();
            }
        });
    }
})

function simControl(cmd){
    pendulums.forEach(p => {
        data = {};
        data['command'] = cmd;
        // console.log('sending PUT with ');
        // console.log(data)
        // console.log('to ' + p.port  +'/sim');
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', baseURL+':'+p.port+'/sim', true);
        xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
        xhr.onload = () => {
            // console.log(xhr.response);
        };
        xhr.send(JSON.stringify(data));

        if (cmd === 'PAUSE' || cmd === 'STOP'){
            p.polling = false;
        } else if (cmd === 'START'){
            p.polling = true;
        }
    });
}

function setParams(i, data){
    // console.log('sending PUT with ');
    // console.log(data)
    // console.log('to ' + pendulums[i].port +'/params');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', baseURL+':'+pendulums[i].port+'/params', true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.onload = () => {
        // console.log(xhr.response);
    };
    xhr.send(JSON.stringify(data));
}

function processForm(i) {
    try{
        const data = {};
        let mass = document.getElementById('mass'+i);
        if (mass.value != ''){
            data.mass = parseFloat(mass.value);
        }

        let windFactor = document.getElementById('windFactor'+i);
        if (windFactor.value != ''){
            data.maxWind = parseFloat(windFactor.value);
        }

        let angle = document.getElementById('angle'+i);
        if (angle.value != ''){
            data.angle = parseFloat(angle.value);
        }
        
        let length = document.getElementById('length'+i);
        if (length.value != ''){
            data.length = parseFloat(length.value);
        }

        data.angularVel = 0;

        console.log(data)
        setParams(i, data)
    } catch(err) {
        console.log(err);
        return false;
    }
}