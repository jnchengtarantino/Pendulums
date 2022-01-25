# Solution to the Vention Technical Test
by John-Nicholas Cheng-Tarantino

## Usage
1. use
> node frontend.js

to startup the UI. This will run at http://localhost:8000

2. use
> node pendulum.js 8080

> node pendulum.js 8081

> node pendulum.js 8082

> node pendulum.js 8083

> node pendulum.js 8084

to spin up the pendulum simulating instances on ports [8080,8084]. These can be run in headless mode by adding & to the end of the command. (Note: in the future this can be made easier through containerization and orchestration or by using a config file)

3. Use the 'Start', 'Pause', 'Stop' buttons on the UI to control the simulation running



## API Description
frontend.js starts a web server to host the frontend on localhost:8000. Each of the pendulums run their own web server on their associated port. The frontend can communicate with two endpoints: /params and /sim. The /params endpoint can only accept the PUT method and can be used to change various parameters defining the pendulum such as the angle, length, max wind factor, mass, etc. The /sim endpoint accepts the GET and PUT methods. GET will get you the current state of the pendulum, namely the angle, length, wind speed, and mass. PUT method expects one parameter 'command' that can be 'START', 'PAUSE', or 'STOP' and affects the running of the simulation.


## Known Problems
- Pausing or stopping the simulation seem to cause the system (either from the frontend or the backend) to hang. While waiting for the hang to resolve, many get requests are generated and since the process then needs to catch up performance takes a large hit. Should look into how the put is handled or potentially how the signalization on the frontend might be causing this.
- Contact/Proximity collision between neighbouring nodes is currently not yet implemented
- Drag and drop functionality is not yet implemented
- Many values such as the UI's expected ports for the pendulums are hard coded and should be made configurable