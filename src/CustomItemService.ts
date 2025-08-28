import * as fs from "fs";
import * as path from "path";
import { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { WTTInstanceManager } from "./WTTInstanceManager";
import { CasesGeneration } from "./CasesGeneration";

import { ConfigItem, CombinedConfigItem } from "./references/consts";

export class CustomItemService
{
    private Instance: WTTInstanceManager;
    private casesGeneration: CasesGeneration = new CasesGeneration();

    public preSptLoad(Instance: WTTInstanceManager): void 
    {
        this.Instance = Instance;
        this.casesGeneration.preSptLoad(this.Instance);
    }

    public postDBLoad(): void
	{
        const config = this.Instance.helpers.config;
        const items: CombinedConfigItem = this.casesGeneration.postDBLoad();

        let numItemsAdded = 0;

        const airdropLoot = this.Instance.configServer.configs["spt-airdrop"].loot;
        const blacklist = this.Instance.configServer.configs["spt-trader"].fence.blacklist;
        const flea = this.Instance.configServer.configs["spt-ragfair"].dynamic.blacklist.custom;

        for (const itemId in items) {
            const itemConfig = items[itemId];

            const { exampleCloneItem, finalItemTplToClone } = this.createExampleCloneItem(itemConfig, itemId);

            this.Instance.customItem.createItemFromClone(exampleCloneItem);
            this.processTraders(itemConfig, itemId);

            // Add to fence blacklist
            blacklist.push(itemId);

            if (config.fleaMarketBlacklisted) {
                // Add to flea blacklist
                flea.push(itemId);
            }

            // Add to airdrop blacklist
            for(const loot in airdropLoot) {
                airdropLoot[loot].itemBlacklist.push(itemId);
            }
            numItemsAdded++;
        }

        if (numItemsAdded > 0) 
        {
            this.Instance.logger.log(
                `[${this.Instance.modName}] Loaded ${numItemsAdded} custom items`,
                LogTextColor.GREEN
            );
        }
        else
        {
            this.Instance.logger.log(
                `[${this.Instance.modName}] No custom items loaded`,
                LogTextColor.GREEN
            );
        }
    }

    /**
   * Creates an example clone item with the provided item configuration and item ID.
   *
   * @param {any} itemConfig - The configuration of the item to clone.
   * @param {string} itemId - The ID of the item.
   * @return {{ exampleCloneItem: NewItemFromCloneDetails, finalItemTplToClone: string }} The created example clone item and the final item template to clone.
   */
    private createExampleCloneItem(
        itemConfig: ConfigItem[string],
        itemId: string
    ): {
            exampleCloneItem: NewItemFromCloneDetails;
            finalItemTplToClone: string;
        } 
    {

        const finalItemTplToClone = itemConfig.itemTplToClone;

        const exampleCloneItem: NewItemFromCloneDetails = {
            itemTplToClone: finalItemTplToClone,
            overrideProperties: itemConfig.overrideProperties ? itemConfig.overrideProperties : undefined,
            parentId: itemConfig.parentId,
            newId: itemId,
            fleaPriceRoubles: itemConfig.fleaPriceRoubles,
            handbookPriceRoubles: itemConfig.handbookPriceRoubles,
            handbookParentId: itemConfig.handbookParentId,
            locales: itemConfig.locales
        };

        if (this.Instance.debug)
        {
            console.log(`Cloning item ${finalItemTplToClone} for itemID: ${itemId}`);
        }
        return { exampleCloneItem, finalItemTplToClone };
    }

     /**
   * Processes traders based on the item configuration.
   *
   * @param {any} itemConfig - The configuration of the item.
   * @param {string} itemId - The ID of the item.
   * @return {void} This function does not return a value.
   */

     private processTraders(
        itemConfig: ConfigItem[string],
        itemId: string
    ): void {
        const tables = this.Instance.database;
        if (!itemConfig.addtoTraders) return;

        const { traderId, traderItems, barterScheme } = itemConfig;

        const trader = tables.traders[traderId];

        for (const item of traderItems) {
            const newItem = {
                _id: itemId,
                _tpl: itemId,
                parentId: "hideout",
                slotId: "hideout",
                upd: {
                    UnlimitedCount: item.unlimitedCount,
                    StackObjectsCount: item.stackObjectsCount
                }
            };

            trader.assort.items.push(newItem);
        }
        trader.assort.barter_scheme[itemId] = [barterScheme];
        trader.assort.loyal_level_items[itemId] = itemConfig.loyallevelitems;
    }
}
