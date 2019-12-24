const service = require("os-service");

if (process.argv[2] == "--add") {
    service.add("pc-mon-server", { programArgs: ["--run"] }, error => {
        if (error) console.trace(error);
    });
} else if (process.argv[2] == "--remove") {
    service.remove("pc-mon-server", error => {
        if (error) console.trace(error);
    });
} else if (process.argv[2] == "--run") {
    service.run(() => {
        service.stop(0);
    });

    console.log("test");
} else {
    // Show usage...
}
