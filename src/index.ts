import { Plugin, PluginEvents } from "@serenityjs/plugins";
import { SlapperCommand } from "./command/SlapperCommand";
import { CustomEntityType, WorldEvent } from "@serenityjs/core";
import { SlapperEntityTrait } from "./traits/SlapperEntityTrait";
import { SlapperRederingTrait } from "./traits/SlapperRederingTrait";
import { log } from "console";
import { StringTag } from "@serenityjs/nbt";
import { SlapperEntityType } from "./entity/SlapperEntityType";

class NitySlappers extends Plugin implements PluginEvents {

  public constructor() {
    super("NitySlappers", "1.0.0");
  }

  public onInitialize(): void {
    new SlapperCommand(this.serenity);
    this.serenity.before(WorldEvent.WorldInitialize, ({ world }) => {
      world.entityPalette.registerTrait(SlapperEntityTrait);
      world.entityPalette.registerTrait(SlapperRederingTrait);
      world.entityPalette.registerType(new CustomEntityType("slapper_entity_type"));
      return true;
    });
    
    log("[NitySlappers] Plugin initialized.");
  }
}

export default new NitySlappers();
