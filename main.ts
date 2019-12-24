import WebSocket from 'ws';
import System from 'systeminformation';
import consola from 'consola';
import service from 'os-service';

interface wsClient extends WebSocket {
    active: boolean;
}

if (process.argv[2] == '--add') {
    service.add('pc-mon-server', { programArgs: ['--run'] }, error => {
        if (error) console.trace(error);
    });
} else if (process.argv[2] == '--run') {
    service.run(() => {
        service.stop(0);
    });
    const start = async () => {
        const ws = new WebSocket.Server({ host: '0.0.0.0', port: 10180 });

        consola.info('Retreiving Static Data');
        const staticData = await System.getStaticData();
        consola.success('Retreived Static Data');

        setInterval(async () => {
            let dynamicData = await System.getDynamicData();
            ws.clients.forEach(client => {
                client.send(JSON.stringify({ staticData, dynamicData }));
            });
        }, 1000);

        ws.on('connection', async (Client: wsClient) => {
            Client.send('Connected!');
            Client.active = true;
            Client.on('pong', () => (Client.active = true));
        });

        setInterval(async () => {
            ws.clients.forEach((Client: wsClient) => {
                if (Client.active === false) return Client.terminate();
                Client.active = false;
                Client.ping(() => {});
            });
        }, 10000);

        consola.ready({
            message: `Server listening on ws://0.0.0.0:10180`,
            badge: true
        });
    };
    start();
}
