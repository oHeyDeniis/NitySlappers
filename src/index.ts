import { Plugin, PluginEvents } from "@serenityjs/plugins";
import { SlapperCommand } from "./command/SlapperCommand";
import { CustomEntityType, WorldEvent } from "@serenityjs/core";
import { SlapperEntityTrait } from "./traits/SlapperEntityTrait";
import { SlapperRederingTrait } from "./traits/SlapperRederingTrait";
import { SlapperEntityTypes } from "./entity/SlapperEntityTypes";


class NitySlappers extends Plugin implements PluginEvents {

  
  public constructor() {
    super("NitySlappers", "1.2.1");
  }

  public onInitialize(): void {

    new SlapperCommand(this.serenity);

    this.serenity.before(WorldEvent.WorldInitialize, ({ world }) => {
      world.entityPalette.registerTrait(SlapperEntityTrait);
      world.entityPalette.registerTrait(SlapperRederingTrait);
      world.entityPalette.registerType(new CustomEntityType(SlapperEntityTypes.SLAPPER_HUMAN_ENTITY_TYPE));
      return true;
    });
    this.logger.info("§e[@oHeyDeniis] §6[NitySlappers] §cinitialized.");


  }
}

export default new NitySlappers();
