let express = require("express");

const host = 'localhost';
const port = 8000;
let app = express();

app.listen(port, () => {
    console.log("UI running on port " + port);
});
app.use(express.static('.'));
app.get('/', (request,response) => {
    response.sendFile('./index.html',{root: __dirname});
});
