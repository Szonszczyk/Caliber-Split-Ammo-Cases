import * as fs from 'fs';
import * as path from "path";

import { WTTInstanceManager } from "./WTTInstanceManager";
import { CombinedConfigItem, ConfigItem, Grid } from "./references/consts";
import idDatabase from "../db/Ids/idDatabase.json";
import { Traders } from '@spt/models/enums/Traders';

export class CasesGeneration
{
    private Instance: WTTInstanceManager;

    public preSptLoad(Instance: WTTInstanceManager): void
    {
        this.Instance = Instance;
    }

    public postDBLoad(): CombinedConfigItem {
        const config = this.Instance.helpers.config;
        const ammos = this.loadAmmo();
        const ammoConfig: { [id: string]: { name: string; shortName: string } } = this.Instance.helpers.idToCaliberMap;
        const generatedItems: CombinedConfigItem = {};
        const idDatabaseOriginal = structuredClone(idDatabase);
        for (const ammoType in ammos) {
            const ammo = ammos[ammoType];
            const caseId = this.resolveHash(`CASEID${ammoType}`);
            const newCase: ConfigItem = {
                itemTplToClone: "5aafbde786f774389d0cbc0f",
                overrideProperties: {
                    BackgroundColor: this.Instance.helpers.colorConverterAPILoaded ? config.backgroundColorColorConverterAPI : config.backgroundColor,
                    Weight: 0,
                    Width: config.Width,
                    Height: config.Height
                },
                parentId: "5795f317245977243854e041",
                handbookParentId: "5b5f6fa186f77409407a7eb7",
                locales: {
                    en: {
                        name: `<b>Custom Ammo Case for ${ammoConfig[ammoType] ? ammoConfig[ammoType].name : ammoType} ammo</b>`,
                        shortName: `${ammoConfig[ammoType] ? ammoConfig[ammoType].shortName : ammoType} CAC`,
                        description: [
                            `<align="center">Custom case that can store all your <b>${ammoConfig[ammoType] ? ammoConfig[ammoType].name : ammoType}</b> ammunition!</align>`
                        ].join('\n')
                    }
                },
                fleaPriceRoubles: Math.floor(config.handbookPriceRoubles*1.3),
                handbookPriceRoubles: config.handbookPriceRoubles,
                clearClonedProps: true,
                addtoInventorySlots: [],
                addtoModSlots: false,
                modSlot: [],
                ModdableItemWhitelist: "",
                ModdableItemBlacklist: "",
                addtoTraders: false,
                traderId: Traders.REF,
                traderItems: [],
                barterScheme: [],
                loyallevelitems: 1,
                addtoBots: false,
                addtoStaticLootContainers: false,
                StaticLootContainers: "",
                Probability: 0,
                masteries: false,
                masterySections: {},
                addweaponpreset: false,
                weaponpresets: [],
                addtoHallOfFame: false,
                addtoSpecialSlots: false
            };

            this.addToTraders(newCase);

            if (this.Instance.helpers.config.useWholeCaseForCaliber_Mode) {
                this.addGridsWholeCaseForCaliber(caseId, newCase, ammo);
            } else {
                this.addGridsAmmoPerColumn(caseId, newCase, ammo);
            }

            generatedItems[caseId] = newCase;
        }
        if (JSON.stringify(idDatabaseOriginal, null, 2) != JSON.stringify(idDatabase, null, 2) ) {
            fs.writeFileSync(path.join(__dirname, "../db/Ids/idDatabase.json"), JSON.stringify(idDatabase, null, 2));
        }
        
        return generatedItems;
    }

    private addToTraders(newCase: ConfigItem): void {
        const config = this.Instance.helpers.config;
        if (config.casesOnPeacekeeper) {
            newCase.addtoTraders = true;
            newCase.traderId = Traders.PEACEKEEPER;
            newCase.traderItems.push({
                "unlimitedCount": true,
                "stackObjectsCount": 5
            });
            newCase.barterScheme.push({
                "count": config.USDPrice,
                "_tpl": "5696686a4bdc2da3298b456a"
            });
        } else
        if (config.casesOnRef) {
            newCase.addtoTraders = true;
            newCase.traderId = Traders.REF;
            newCase.traderItems.push({
                "unlimitedCount": true,
                "stackObjectsCount": 5
            });
            newCase.barterScheme.push({
                "count": config.gpCoinPrice,
                "_tpl": "5d235b4d86f7742e017bc88a"
            });
        } else
        if (config.casesOnSkier) {
            newCase.addtoTraders = true;
            newCase.traderId = Traders.SKIER;
            newCase.traderItems.push({
                "unlimitedCount": true,
                "stackObjectsCount": 5
            });
            newCase.barterScheme.push({
                "count": config.EuroPrice,
                "_tpl": "569668774bdc2da2298b4568"
            });
        } else
        if (config.casesOnJaeger) {
            newCase.addtoTraders = true;
            newCase.traderId = Traders.JAEGER;
            newCase.traderItems.push({
                "unlimitedCount": true,
                "stackObjectsCount": 5
            });
            newCase.barterScheme.push({
                "count": Math.floor(config.RoublesPriceMultiplier*config.handbookPriceRoubles),
                "_tpl": "5449016a4bdc2d6f028b456f"
            });
        } else
        if (config.casesOnPrapor) {
            newCase.addtoTraders = true;
            newCase.traderId = Traders.PRAPOR;
            newCase.traderItems.push({
                "unlimitedCount": true,
                "stackObjectsCount": 5
            });
            newCase.barterScheme.push({
                "count": config.barterPrice,
                "_tpl": config.barterType
            });
        }
    }

    private addGridsAmmoPerColumn(
        caseId: string,
        newCase: ConfigItem,
        ammoInCase: string[]
    ): void {
        const grids: Grid[] = [];
        for (const ammo of ammoInCase) {
            grids.push({
                _id: this.resolveHash(`CASE:${caseId}#AMMO:${ammo}#`),
                _name: `CASE:${caseId}#AMMO:${ammo}#`,
                _parent: caseId,
                _proto: "55d329c24bdc2d892f8b4567",
                _props: {
                    cellsH: 1,
                    cellsV: this.Instance.helpers.config.caseSlotsPerAmmo,
                    filters: [{
                        Filter: [ ammo ],
                        ExcludedFilter: []
                    }],
                    isSortingTable: false,
                    maxCount: 0,
                    maxWeight: 0,
                    minCount: 0
                }
            })
        }
        newCase.overrideProperties.Grids = grids;
    }

    private addGridsWholeCaseForCaliber(
        caseId: string,
        newCase: ConfigItem,
        ammoInCase: string[]
    ): void {
        const config = this.Instance.helpers.config;
        const grids: Grid[] = [];
        grids.push({
            _id: this.resolveHash(`CASE:${caseId}#AMMO:ALL#`),
            _name: `CASE:${caseId}#AMMO:ALL#`,
            _parent: caseId,
            _proto: "55d329c24bdc2d892f8b4567",
            _props: {
                cellsH: config.wholeCaseHeight,
                cellsV: config.wholeCaseWidth,
                filters: [{
                    Filter: ammoInCase,
                    ExcludedFilter: []
                }],
                isSortingTable: false,
                maxCount: 0,
                maxWeight: 0,
                minCount: 0
            }
        });

        newCase.overrideProperties.Grids = grids;
    }

    private loadAmmo(): { [ammoName: string]: string[] } {
        const ammo: { [ammoName: string]: string[] } = {};
        const ammoConfig: { [id: string]: { name: string; shortName: string } } = this.Instance.helpers.idToCaliberMap;
        const items = this.Instance.database.templates.items;

        const config = this.Instance.helpers.config;

        for (const id in items) {
            const item = items[id];

            // only add items of type ammo
            if (item._parent != "5485a8684bdc2da71d8b4567") continue;

            if (id === "5485a8684bdc2da71d8b4567") continue;

            // only use known calibers
            if (config.useOnlyKnownCalibers && !ammoConfig[item._props.Caliber]) continue;

            // use all calibers, just remove known bad/unnecessary ones
            if (config.removeBadCalibers && config.badCalibers.includes(item._props?.Caliber)) continue;
            
            if (!ammo[item._props.Caliber]) ammo[item._props.Caliber] = [];
            ammo[item._props.Caliber].push(id);

        }

        // Sort each array by PenetrationPower
        for (const caliber in ammo) {
            ammo[caliber].sort((a, b) => {
                const penA = items[a]._props.PenetrationPower || 0;
                const penB = items[b]._props.PenetrationPower || 0;
                return penA - penB;
            });
        }

        return ammo;
    }

    private resolveHash(ID: string): string {
        if (!idDatabase[ID]) {
            idDatabase[ID] = this.Instance.hashUtil.generate();
        }
        return idDatabase[ID];
    }
}