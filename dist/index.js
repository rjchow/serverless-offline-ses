"use strict";
const child_process_1 = require("child_process");
const path_1 = require("path");
const NODE_MODULES_PATH = path_1.join(process.cwd(), "./node_modules/.bin");
class ServerlessOfflineSesPlugin {
    constructor(serverless) {
        var _a, _b;
        this.serverless = serverless;
        this.sesInstances = {};
        this.spawnSesProcess = async (options) => {
            const outputDir = options.outputDir ? options.outputDir : "./output";
            const port = options.port ? options.port.toString() : "9001";
            const clean = options.clean ? true : false;
            const args = [`${NODE_MODULES_PATH}/aws-ses-local`];
            args.push(`--port`);
            args.push(port);
            if (clean) {
                args.push(`-c`);
            }
            if (outputDir) {
                args.push(`--outputDir`);
                args.push(outputDir);
            }
            this.serverless.cli.log(`serverless-offline-ses - Starting ses with command ${args.join(" ")}`);
            const proc = child_process_1.spawn("/bin/sh", ["-c", args.join(" ")]);
            const pause = async (duration) => new Promise((r) => setTimeout(r, duration));
            await pause(1000);
            proc.stdout.on("data", (data) => {
                this.serverless.cli.log(`serverless-offline-ses: ${data.toString()}`);
            });
            proc.stderr.on("data", (data) => {
                this.serverless.cli.log(`serverless-offline-ses: ${data.toString()}`);
            });
            proc.on("error", (error) => {
                this.serverless.cli.log(`serverless-offline-ses error: ${error.toString()}`);
                throw error;
            });
            proc.on("close", (code) => {
                this.serverless.cli.log(`serverless-offline-ses process exited with code ${code}`);
                if (code !== 0) {
                    this.serverless.cli.log(`serverless-offline-ses process exited with code ${code}`);
                }
            });
            if (proc.pid == null || (proc.exitCode && proc.exitCode !== 0)) {
                this.serverless.cli.log(`serverless-offline-ses process failed to start with code ${proc.exitCode}`);
                throw new Error("Unable to start the serverless-offline-ses process");
            }
            this.sesInstances[port] = proc;
            [
                "beforeExit",
                "exit",
                "SIGINT",
                "SIGTERM",
                "SIGUSR1",
                "SIGUSR2",
                "uncaughtException",
            ].forEach((eventType) => {
                process.on(eventType, () => {
                    this.killSesProcess(this.SeverlessOfflineSesConfig);
                });
            });
            return {
                proc,
                port,
            };
        };
        this.killSesProcess = (options) => {
            const port = options.port ? options.port.toString() : 9001;
            if (this.sesInstances[port] != null) {
                this.sesInstances[port].kill("SIGKILL");
                delete this.sesInstances[port];
            }
        };
        this.shouldExecute = () => {
            if (this.SeverlessOfflineSesConfig.stages &&
                this.SeverlessOfflineSesConfig.stages.includes(this.serverless.service.provider.stage)) {
                return true;
            }
            return false;
        };
        this.startSes = async () => {
            if (!this.shouldExecute()) {
                this.serverless.cli.log("serverless-offline-ses - non configured stage. Will not start.");
                return;
            }
            const { port } = await this.spawnSesProcess(this.SeverlessOfflineSesConfig);
            this.serverless.cli.log(`serverless-offline-ses started - Listening on ${port}`);
            await Promise.resolve();
        };
        this.stopSes = async () => {
            this.killSesProcess(this.SeverlessOfflineSesConfig);
            this.serverless.cli.log("serverless-offline-ses - Stopped");
        };
        this.commands = {};
        this.SeverlessOfflineSesConfig = ((_b = (_a = this.serverless.service) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.ses) || {};
        this.hooks = {
            "before:offline:start:end": this.stopSes,
            "before:offline:start:init": this.startSes,
        };
    }
}
module.exports = ServerlessOfflineSesPlugin;
//# sourceMappingURL=index.js.map