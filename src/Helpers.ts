import * as fs from "fs";
import * as path from "path";
import { jsonc } from "jsonc";

import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

import { WTTInstanceManager } from "./WTTInstanceManager";

import { CaliberInfoStruct} from "./references/consts";

export class Helpers
{
    private Instance: WTTInstanceManager;
    public colorConverterAPILoaded: boolean;
    public config: any;
    public dbCalibers: CaliberInfoStruct;
    public idToCaliberMap: { [id: string]: { name: string; shortName: string } };

    constructor(Instance: WTTInstanceManager)
    {
        this.Instance = Instance;
        this.colorConverterAPILoaded = this.colorConverterAPICheck();
        this.loadConfig();

        this.dbCalibers = this.loadCombinedCalibers('../db/Calibers');

        this.idToCaliberMap = Object.entries(this.dbCalibers).reduce(
        (acc, [, info]) => {
            acc[info.id] = {
                name: info.name,
                shortName: info.shortName
            };
            return acc;
        },
        {} as { [id: string]: { name: string; shortName: string } });
    }

    private colorConverterAPICheck(): boolean 
    {
        const pluginName = "rairai.colorconverterapi.dll";
        try {
            const pluginList = fs.readdirSync("./BepInEx/plugins").map(plugin => plugin.toLowerCase());
            return pluginList.includes(pluginName);
        } catch {
            return false;
        }
    }

    private loadConfig(): void
    {
        const configPath = path.resolve(__dirname, "../config/config.jsonc");
		this.config = jsonc.parse(fs.readFileSync(configPath, "utf-8"));
        if (!this.isValidHexColor(this.config.backgroundColorColorConverterAPI)) {
            this.Instance.logger.log(
                `[${this.Instance.modName}] 'backgroundColorColorConverterAPI' in config: ${this.config.backgroundColorColorConverterAPI} is not valid hex color!`,
                LogTextColor.RED
            );
            this.config.backgroundColorColorConverterAPI = "red";
        }
    }

    private loadCombinedConfig<T>(
        subfolder: string,
        mergeStrategy?: (acc: T, current: T) => void
    ): T {
        const folderPath = path.join(__dirname, subfolder);
        const configFiles = fs.readdirSync(folderPath);
        const combinedConfig: T = {} as T;

        configFiles.forEach((file) => {
            const filePath = path.join(folderPath, file);
            const fileContents = fs.readFileSync(filePath, "utf-8");
            const config = JSON.parse(fileContents) as T;

            if (mergeStrategy) {
                mergeStrategy(combinedConfig, config);
            } else {
                Object.assign(combinedConfig, config);
            }
        });

        return combinedConfig;
    }

    private loadCombinedCalibers(usePath: string): CaliberInfoStruct {
        return this.loadCombinedConfig<CaliberInfoStruct>(usePath);
    }

    public saveJsonToFile(
        data: any,
        subfolder: string
    ): void {
        const formatted = JSON.stringify(data, (key, value) => value, 2)
            .replace(/\[\s*([\s\S]*?)\s*]/g, match => match.replace(/\s+/g, ' '));

        const newName = this.Instance.hashUtil.generate();
        const filePath = path.join(__dirname, `../db/${subfolder}/${newName}.json`);
        
        fs.writeFileSync(filePath, formatted);

        this.Instance.logger.log(
            `[${this.Instance.modName}] Helpers.saveJsonToFile: Database '${subfolder}/${newName}.json' was created`,
            LogTextColor.GREEN
        );
    }

    private isValidHexColor(color: string): boolean {
		const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
		return hexRegex.test(color);
	}
}