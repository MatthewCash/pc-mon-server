const WebSocket = require("ws");
const System = require("systeminformation");
const consola = require("consola");
const service = require("os-service");

if (process.argv[2] == "--add") {
    service.add("pc-mon-server", { programArgs: ["--run"] }, error => {
        if (error) console.trace(error);
    });
} else if (process.argv[2] == "--run") {
    service.run(() => {
        service.stop(0);
    });
    const start = async () => {
        const wss = new WebSocket.Server({ host: "0.0.0.0", port: 10180 });

        consola.info("Retreiving Static Data");
        const staticData = await System.getStaticData();
        consola.success("Retreived Static Data");

        setInterval(async () => {
            let dynamicData = await System.getDynamicData();
            wss.clients.forEach(client => {
                client.send(JSON.stringify({ staticData, dynamicData }));
            });
        }, 1000);

        wss.on("connection", async ws => {
            ws.send("Connected!");
            ws.active = true;
            ws.on("pong", () => (ws.active = true));
        });

        setInterval(async () => {
            wss.clients.forEach(client => {
                if (client.active === false) return client.terminate();
                client.active = false;
                client.ping(() => {});
            });
        }, 10000);

        consola.ready({
            message: `Server listening on ws://0.0.0.0:10180`,
            badge: true
        });
    };
    start();
}
