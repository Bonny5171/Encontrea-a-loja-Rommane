// in sublime
var express = require('express');
var path = require('path');

var port = process.env.PORT || 8080;
var app = express();
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.use('/static', express.static('static'))

app.listen(port, function () {
 console.log(`App rodando na porta: "${port}"`);
});