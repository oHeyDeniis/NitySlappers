import { CustomEnum, Entity, Player, Serenity, StringEnum } from "@serenityjs/core";
import { SlapperRederingTrait } from "../traits/SlapperRederingTrait";
import { SlapperEntityTrait } from "../traits/SlapperEntityTrait";
import { StringTag } from "@serenityjs/nbt";
import { Vector3f } from "@serenityjs/protocol";

export class SlapperCommand {

    constructor(
        public serenity: Serenity
    ) {
        serenity.commandPalette.register(
            "slapper",
            "Creates slappers.",
            (registry) => {
                registry.overload({
                    action: [SlapperCommandEnum, true],
                    slapper: [StringEnum, true],
                    args: [StringEnum, true],
                    more: [StringEnum, true],
                }, (command) => {
                    if (command.origin instanceof Player)
                        this.onExecute(command.origin, [command.action.result, command.slapper.result, command.args.result, command.more.result]);
                    return { message: undefined };
                })
            },
            (who) => { who.origin instanceof Player ? who.origin.sendMessage("Usage: /slapper help") : null }
        )
    }
    onExecute(player: Player, args: any[]) {
        if (!player.isOp) {
            player.sendMessage("You do not have permission to use this command.");
            return;
        }
        switch (args[0]) {
            case "chunklist":
                const chunk = player.getChunk();
                for (const [id, data] of chunk.getAllEntityStorages()) {
                    let identifier = data.get<StringTag>("identifier");
                    let identifierStr = identifier ? identifier.valueOf() : "unknown";
                    player.sendMessage(`Entity ID: ${id}, Data: ${identifierStr}`);
                }
                player.sendMessage("Finished listing entities in current chunk.");
                break;
            case "help":
            case "h":
                player.sendMessage("Slapper Command Help:");
                player.sendMessage("/slapper create [name] [id] - Creates a slapper with the given name and id. ");
                player.sendMessage("/slapper remove [id] - Removes the slapper with the given id.");
                player.sendMessage("/slapper list - Lists all slappers in the current dimension.");
                player.sendMessage("/slapper addcmd [id] [cmd] - Adds a command to the slapper with the given id. (use . for spaces)");
                player.sendMessage("/slapper removecmd [id] [cmd] - Removes a command from the slapper with the given id. (use . for spaces)");
                player.sendMessage("/slapper tpme [id] - Teleports the slapper with the given id to you.");
                player.sendMessage("/slapper tp [id] - Teleports you to the slapper with the given id.");
                player.sendMessage("/slapper setname [id] [new.name] - Sets the name of the slapper with the given id. (use . for spaces)");
                player.sendMessage("/slapper chunklist - Lists all entities in the current chunk.");

                break;
            case "setname":
            case "sn":
                const idToSetName = parseInt(args[1] + "s");

                let newName = args[2] || "Slapper.slapper";
                newName = newName.replace(".", " ");
                const entityToSetName = Array.from(player.dimension.entities.values()).find(ent => {
                    if (ent.hasTrait(SlapperEntityTrait)) {
                        const sp = ent.getTrait(SlapperEntityTrait)!;
                        return sp.getId() === idToSetName;
                    }
                    return false;
                });
                if (entityToSetName && entityToSetName.hasTrait(SlapperEntityTrait)) {
                    const sp = entityToSetName.getTrait(SlapperEntityTrait)!;
                    sp.setDisplayName(newName);
                    player.sendMessage(`Slapper with id "${idToSetName}" has been renamed to "${newName}".`);
                } else {
                    player.sendMessage(`No slapper found with id "${idToSetName}".`);
                }
                break;
            case "tpme":
                const idToTpMe = parseInt(args[1] + "s");

                const entityToTpMe = Array.from(player.dimension.entities.values()).find(ent => {
                    if (ent.hasTrait(SlapperEntityTrait)) {
                        const sp = ent.getTrait(SlapperEntityTrait)!;
                        return sp.getId() === idToTpMe;
                    }
                    return false;
                }
                );
                if (entityToTpMe?.hasTrait(SlapperEntityTrait)) {
                    entityToTpMe.teleport(player.position.add(new Vector3f(0, 1, 0)));
                    player.sendMessage(`Slapper with id "${idToTpMe}" has been teleported to you.`);
                } else {
                    player.sendMessage(`No slapper found with id "${idToTpMe}".`);
                }
                break;
            case "tp":
                const idToTp = parseInt(args[1] + "s");
                const entityToTp = Array.from(player.dimension.entities.values()).find(ent => {
                    if (ent.hasTrait(SlapperEntityTrait)) {
                        const sp = ent.getTrait(SlapperEntityTrait)!;
                        return sp.getId() === idToTp;
                    }
                    return false;
                });
                if (entityToTp?.hasTrait(SlapperEntityTrait)) {
                    player.teleport(entityToTp.position);
                    player.sendMessage(`Teleported to slapper with id "${idToTp}".`);
                } else {
                    player.sendMessage(`No slapper found with id "${idToTp}".`);
                }
                break;
            case "removecmd":
            case "rc":
                const idToRemoveCmd = parseInt(args[1] + "s");

                let commandToRemove = args[2] ?? "say.hello";
                commandToRemove = commandToRemove.replace(".", " ");
                const entityToRemoveCmd = Array.from(player.dimension.entities.values()).find(ent => {
                    if (ent.hasTrait(SlapperEntityTrait)) {
                        const sp = ent.getTrait(SlapperEntityTrait)!;
                        return sp.getId() === idToRemoveCmd;
                    }
                    return false;
                });
                if (entityToRemoveCmd?.hasTrait(SlapperEntityTrait)) {
                    const sp = entityToRemoveCmd.getTrait(SlapperEntityTrait)!;
                    sp.removeCommand(commandToRemove);
                    player.sendMessage(`Command "${commandToRemove}" has been removed from slapper with id "${idToRemoveCmd}".`);
                } else {
                    player.sendMessage(`No slapper found with id "${idToRemoveCmd}".`);
                }
                break;
            case "addcmd":
            case "ac":
                const idToAddCmd = parseInt(args[1] + "s");
                let commandToAdd = args[2] ?? "say.Hello!";
                commandToAdd = commandToAdd.replace(".", " ");
                if (commandToAdd.length === 0) {
                    player.sendMessage("Command cannot be empty.");
                    return;
                }
                if (isNaN(idToAddCmd)) {
                    player.sendMessage("Invalid slapper ID.");
                    return;
                }
                const entityToAddCmd = Array.from(player.dimension.entities.values()).find(ent => {
                    if (ent.hasTrait(SlapperEntityTrait)) {
                        const sp = ent.getTrait(SlapperEntityTrait)!;
                        return sp.getId() === idToAddCmd;
                    }
                    return false;
                });
                if (entityToAddCmd && entityToAddCmd.hasTrait(SlapperEntityTrait)) {
                    const sp = entityToAddCmd.getTrait(SlapperEntityTrait)!;
                    sp.addCommand(commandToAdd);
                    player.sendMessage(`Command "${commandToAdd}" has been added to slapper with id "${idToAddCmd}".`);
                } else {
                    player.sendMessage(`No slapper found with id "${idToAddCmd}".`);
                }
                break;
            case "l":
            case "list":
                const slappers: SlapperEntityTrait[] = [];
                for (const ent of player.dimension.entities.values()) {
                    if (ent.hasTrait(SlapperEntityTrait)) {
                        slappers.push(ent.getTrait(SlapperEntityTrait)!);
                    }
                }
                //const slappers = Array.from(player.dimension.entities.values()).filter(ent => ent instanceof SlapperEntity) as SlapperEntity[];
                if (slappers.length === 0) {
                    player.sendMessage("No slappers found in this dimension.");
                    return;
                }
                slappers.forEach(slapper => {
                    player.sendMessage(`Slapper ID: ${slapper.getId()}, Name: ${slapper.getDisplayName()} commands: [${slapper.getCommands().join(", ")}]`);
                });
                break;
            case "rm":
            case "remove":
                const idToRemove = parseInt(args[1] + "s");
                const entityToRemove = Array.from(player.dimension.entities.values()).find(ent => {
                    if (ent.hasTrait(SlapperEntityTrait)) {
                        const sp = ent.getTrait(SlapperEntityTrait)!;
                        return sp.getId() === idToRemove;
                    }
                    return false;
                });
                if (entityToRemove && entityToRemove.hasTrait(SlapperEntityTrait)) {
                    entityToRemove.despawn();
                    player.dimension.entities.delete(entityToRemove.uniqueId);
                    player.sendMessage(`Slapper with id "${idToRemove}" has been removed.`);
                } else {
                    player.sendMessage(`No slapper found with id "${idToRemove}".`);
                }
                break;
            case "create":
            case "c":
            case "new":
            case "add":
            case "criar":
            case "cc":
                let sname = args[1] || "Slapper";
                sname = sname.replace(".", " ");
                const sentityId = args[2] ? parseInt(args[2] + "s") : Math.floor(Math.random() * 100000);
                const storage = SlapperEntityTrait.createPreStorage(
                    player.position,
                    player.skin.getSerialized(),
                    sname,
                    SlapperEntityTrait.generateUUID(),
                    sentityId,
                    [],
                    player.rotation
                );
                const entity = new Entity(player.dimension, "slapper_entity_type", { storage: storage });
                const traitSlapper = entity.getTrait(SlapperEntityTrait) ?? entity.addTrait(SlapperEntityTrait);
                entity.position = player.position;
                entity.addTrait(SlapperRederingTrait);
                entity.isAlive = true;
                player.dimension.entities.set(entity.uniqueId, entity);
                player.sendMessage(`Custom entity created with ID: ${traitSlapper.getId()} and Name: ${traitSlapper.getDisplayName()}`);
                break;
            default:
                player.sendMessage("Unknown subcommand. Usage: /slapper <create [name]|remove [id]|list|addcmd [id] [cmd]|removecmd [id] [cmd]>");
                break;

        }

    }
}
export class SlapperCommandEnum extends CustomEnum {
    static readonly identifier: string = "slapper_cmd";
    static readonly options: string[] = [
        "create",
        "remove",
        "list",
        "addcmd",
        "removecmd",
        "tpme",
        "tp",
        "setname",
        "chunklist",
        "help"
    ];
    optional: boolean = true;
    static readonly strict: boolean = false;

    validate(_error?: boolean): boolean {
        return true;
    }


}