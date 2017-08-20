const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 3000 }); 
let clients = [];

ws.on('connection', function(client){
    clients.push(client);
    client.on('message',function(data){
        client.send(data);
    });

    client.on('close', () => {
        let index = clients.indexOf(client);
        if (index !== -1) {
            clients.splice(index, 1);
            console.log('断开连接');
        }
    });
});