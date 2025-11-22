import { Dimension, Entity, EntityDespawnOptions, EntityIdentifier, EntityLevelStorage, EntityProperties, EntitySpawnOptions, EntityType, ItemStack, Player, PlayerAbilities, PlayerEntityRenderingTrait, PlayerHungerTrait } from "@serenityjs/core";
import { DataPacket, DeviceOS, Gamemode, Rotation, SerializedSkin, Vector3f } from "@serenityjs/protocol";
import { SlapperRederingTrait } from "../traits/SlapperRederingTrait";
import { SlapperEntityTrait } from "../traits/SlapperEntityTrait";
import { get } from "http";
import { CompoundTag, LongTag } from "@serenityjs/nbt";
import { log } from "console";

export class SlapperEntity extends Entity {

    constructor(
        entiyOptions: Partial<{
            entityId: number | undefined;
            uuid: string | undefined;
            skin: SerializedSkin | undefined;
            displayName: string | undefined;
            position: Vector3f;
            itemInHand: ItemStack;
            armor: Partial<{
                helmet: ItemStack | undefined;
                chestplate: ItemStack | undefined;
                leggings: ItemStack | undefined;
                boots: ItemStack | undefined;
            }>;
            rotation: Rotation | undefined;


        }> = {},
        dimension: Dimension,
        properties?: Partial<EntityProperties>) {
        const storage = new CompoundTag();
        const uniqueId = BigInt(997);// test
        storage.set("UniqueID", new LongTag(BigInt(997), "UniqueID")); // test
        super(dimension, "slapper_entity_type", {
            storage: properties?.storage ?? storage,
        });

        this.position = entiyOptions.position || new Vector3f(0, 0, 0);

        const sp = this.getSlapperEntityTrait();
        this.rotation.yaw = entiyOptions.rotation?.yaw || 0;
        this.rotation.pitch = entiyOptions.rotation?.pitch || 0;
        this.rotation.headYaw = entiyOptions.rotation?.headYaw || 0;
        sp.uuid = entiyOptions.uuid || SlapperEntity.generateUUID();
        sp.skin = entiyOptions.skin || SerializedSkin.empty();
        sp.displayName = entiyOptions.displayName || "Slapper";
        sp.itemInHand = entiyOptions.itemInHand || ItemStack.empty();
        sp.setArmor(entiyOptions.armor || {});
        sp.setId(entiyOptions.entityId || Math.floor(Math.random() * 100000));
        if (this.hasTrait(PlayerEntityRenderingTrait)) {
            this.removeTrait(PlayerEntityRenderingTrait);
        }
        if (this.hasTrait(PlayerHungerTrait)) {
            this.removeTrait(PlayerHungerTrait);
        }
        this.addTrait(SlapperRederingTrait);

        this.storage.setIdentifier(this.type.identifier);



        // Assign the unique id to the storage
        this.storage.setUniqueId(uniqueId);

        // Set the position of the as the dimension spawn position
        this.storage.setPosition(this.position);
        log(`SlapperEntity created with UUID: ${sp.getUuid()} and ID: ${sp.getId()}`);

    }
    spawn(options?: Partial<EntitySpawnOptions>): this {
        // super.spawn(options);
        return this;
    }
    despawn(options?: Partial<EntityDespawnOptions>): this {
        this.isAlive = false;
        this.dimension.entities.delete(this.uniqueId);
        this.getRenderingTrait().despawnForAllViewers();
        return this;
    }

    getRenderingTrait(): SlapperRederingTrait {
        return this.getTrait(SlapperRederingTrait) ?? this.addTrait(SlapperRederingTrait);
    }
    getSlapperEntityTrait() {
        return this.getTrait(SlapperEntityTrait) ?? this.addTrait(SlapperEntityTrait);
    }

    public static generateUUID(): string {
        const prefix = 'slapper';

        function randomHex(length: number): string {
            return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        }

        const part1 = randomHex(8);
        const part2 = randomHex(4);
        const part3 = randomHex(4);
        const part4 = randomHex(4);
        const part5 = randomHex(12);

        return `${part1}-${part2}-${part3}-${part4}-${part5}`;
    }
    public send(...packets: Array<DataPacket>): void {
    }
    public sendImmediate(...packets: Array<DataPacket>): void {
        this.send(...packets);
    }
    isPlayer(): this is Player {
        return true;
    }
    public getGamemode(): Gamemode {
        return this.gamemode;
    }
    public gamemode: Gamemode = this.world.getDefaultGamemode();
    public isOp: boolean = false;
    public clientSystemInfo = {
        identifier: "unknown",
        os: DeviceOS.Android,
    };
    public readonly abilities: PlayerAbilities = new PlayerAbilities(this as any);

}