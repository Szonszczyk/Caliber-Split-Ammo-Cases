export interface CombinedConfigItem 
{
    [itemId: string]: ConfigItem;
}

export interface ConfigItem 
{
    itemTplToClone: string;
    overrideProperties: {
        Prefab: {
            path: string;
            rcid: string;
        };
        ReverbVolume: number;
    };
    parentId: string;
    fleaPriceRoubles: number;
    handbookPriceRoubles: number;
    handbookParentId: string;
    locales: {
        [locale: string]: {
            name: string;
            shortName: string;
            description: string;
        };
    };
    clearClonedProps: boolean;
    addtoInventorySlots: string[];
    addtoModSlots: boolean;
    modSlot: string[];
    ModdableItemWhitelist: string;
    ModdableItemBlacklist: string;
    addtoTraders: boolean;
    traderId: traderIDs;
    traderItems: {
        unlimitedCount: boolean;
        stackObjectsCount: number;
    }[];
    barterScheme: {
        count: number;
        _tpl: string;
    }[];
    loyallevelitems: number;
    addtoBots: boolean;
    addtoStaticLootContainers: boolean;
    StaticLootContainers: string;
    Probability: number;
    masteries: boolean;
    masterySections: {
        Name: string;
        Templates: string[];
    };
    addweaponpreset: boolean;
    weaponpresets: Preset[];
    addtoHallOfFame: boolean;
    addtoSpecialSlots: boolean;
}

export interface Item 
{
    _id: string;
    _tpl: string;
    parentId?: string;
    slotId?: string;
}
  
export interface Preset 
{
    _changeWeaponName: boolean;
    _encyclopedia?: string;
    _id: string;
    _items: Item[];
    _name: string;
    _parent: string;
    _type: string;
}

export interface CaliberInfoStruct
{
    [caliberName: string]: {
        name: string;
        id: string;
        shortName: string;
    }
}

export interface Grid
{
    _id: string,
    _name: string,
    _parent: string,
    _proto: string,
    _props: {
        cellsH: number,
        cellsV: number,
        filters: [{
            Filter: string[],
            ExcludedFilter: []
        }],
        isSortingTable: boolean,
        maxCount: number,
        maxWeight: number,
        minCount: number
    }
}