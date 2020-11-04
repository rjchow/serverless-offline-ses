import Serverless from "serverless";
import { ServerlessPluginCommand } from "../types/serverless-plugin-command";
declare class ServerlessOfflineSesPlugin {
    private serverless;
    readonly commands: Record<string, ServerlessPluginCommand>;
    readonly hooks: Record<string, () => Promise<any>>;
    private SeverlessOfflineSesConfig;
    private sesInstances;
    constructor(serverless: Serverless);
    private spawnSesProcess;
    private killSesProcess;
    private shouldExecute;
    private startSes;
    private stopSes;
}
export = ServerlessOfflineSesPlugin;
