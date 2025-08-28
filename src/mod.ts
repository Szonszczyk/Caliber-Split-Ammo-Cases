import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

import { WTTInstanceManager } from "./WTTInstanceManager";
import { CustomItemService } from "./CustomItemService";


class CaliberSplitAmmoCases
implements IPreSptLoadMod, IPostDBLoadMod
{
	private modName = "CaliberSplitAmmoCases";
	private Instance: WTTInstanceManager = new WTTInstanceManager();
	private customItemService: CustomItemService = new CustomItemService();
	

	public preSptLoad(container: DependencyContainer): void
	{
		this.Instance.preSptLoad(container, this.modName);
		this.Instance.modName = this.modName;
		
        this.displayCreditBanner();
		this.customItemService.preSptLoad(this.Instance);
	}

	postDBLoad(container: DependencyContainer): void
	{
		this.Instance.postDBLoad(container);
		this.customItemService.postDBLoad();

		this.Instance.logger.log(
			`[${this.modName}] has been loaded!`,
			LogTextColor.CYAN
		);
	}

    private displayCreditBanner(): void
    {
        this.Instance.logger.log(
            `[${this.modName}] Developer: Szonszczyk`,
            LogTextColor.GREEN
        );
    }
}

module.exports = { mod: new CaliberSplitAmmoCases() };