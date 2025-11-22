import { EntityAttributeTrait, EntityEquipmentTrait, EntityIdentifier, EntityInteractMethod, EntityNameableTrait, EntityTrait, ItemStack, Player } from "@serenityjs/core";
import { SlapperEntity } from "../entity/SlapperEntity";
import { log } from "console";
import { ActorDataId, ActorDataType, ActorFlag, DataItem, Rotation, SerializedSkin, SetActorDataPacket, SkinImage, Vector3f } from "@serenityjs/protocol";
import { SlapperRederingTrait } from "./SlapperRederingTrait";
import { CompoundTag, FloatTag, IntTag, ListTag, LongTag, StringTag } from "@serenityjs/nbt";

export class SlapperEntityTrait extends EntityTrait {

    identifier: string = "slapper_entity_trait";
    static identifier: string = "slapper_entity_trait";

    static readonly types: Array<EntityIdentifier> = [
        EntityIdentifier.Player,
        "slapper_entity_type" as EntityIdentifier
    ]

    public id: number = -1;
    public uuid: string = "00000000-0000-0000-0000-000000000021";
    public skin: SerializedSkin = SerializedSkin.empty();
    public displayName: string = "Slapper";
    public itemInHand: ItemStack = ItemStack.empty();
    public helmet: ItemStack = ItemStack.empty();
    public chestplate: ItemStack = ItemStack.empty()
    public leggings: ItemStack = ItemStack.empty();
    public boots: ItemStack = ItemStack.empty();

    getUuid(): string {
        return this.entity.getStorageEntry<StringTag>("SlapperUUID")?.valueOf() || this.uuid;
    }
    getId(): number {
        return this.entity.getStorageEntry<IntTag>("SlapperID")?.valueOf() || this.id;
    }
    setId(id: number): void {
        this.entity.setStorageEntry("SlapperID", new IntTag(id, "SlapperID"));
        this.id = id;
    }
    setUuid(uuid: string): void {
        this.entity.setStorageEntry("SlapperUUID", new StringTag(uuid, "SlapperUUID"));
        this.uuid = uuid;
    }
    getDisplayName(): string {
        return this.entity.getStorageEntry<StringTag>("SlapperDisplayName")?.valueOf() || this.displayName;
    }
    setDisplayName(name: string): void {
        this.entity.setStorageEntry("SlapperDisplayName", new StringTag(name, "SlapperDisplayName"));
        this.entity.setNametagAlwaysVisible(true);
        this.entity.setNametag(name);


        this.displayName = name;
        this.getRenderingTrait().updateDisplayName();
    }

    getItemInHand(): ItemStack {
        return this.itemInHand;
    }
    setItemInHand(item: ItemStack): void {
        this.itemInHand = item;
    }
    addCommand(command: string): void {
        const commmandTag = this.entity.getStorageEntry<ListTag<StringTag>>("SlapperCommandsList") ?? new ListTag<StringTag>([], "SlapperCommandsList");
        const existsingCommands = this.getCommands();
        existsingCommands.push(command);
        const commandTags: StringTag[] = [];
        for (const cmd of existsingCommands) {
            commandTags.push(new StringTag(cmd, cmd));
        }

        const newCommandTag = new ListTag<StringTag>(commandTags, "SlapperCommandsList");
        this.entity.setStorageEntry("SlapperCommandsList", newCommandTag);


    }
    getCommands(): string[] {
        const commandTag = this.entity.getStorageEntry<ListTag<StringTag>>("SlapperCommandsList");
        const commands: string[] = [];
        if (commandTag) {
            for (const cmdTag of commandTag.values()) {
                commands.push(cmdTag?.valueOf() ?? "");
            }
            return commands;
        } else {
            return [];
        }
    }
    removeCommand(command: string): void {
        const commandTag = this.entity.getStorageEntry<ListTag<StringTag>>("SlapperCommandsList");
        if (commandTag) {
            const commands = this.getCommands();
            const index = commands.indexOf(command);
            if (index > -1) {
                commands.splice(index, 1);
            }
            const commandTags: StringTag[] = [];
            for (const cmd of commands) {
                commandTags.push(new StringTag(cmd, cmd));
            }
            const newCommandTag = new ListTag<StringTag>(commandTags, "SlapperCommandsList");
            this.entity.setStorageEntry("SlapperCommandsList", newCommandTag);
        }
    }
    setArmor(armors: Partial<{
        helmet: ItemStack | undefined;
        chestplate: ItemStack | undefined;
        leggings: ItemStack | undefined;
        boots: ItemStack | undefined;
    }>): void {
        if (armors.helmet !== undefined) this.helmet = armors.helmet;
        if (armors.chestplate !== undefined) this.chestplate = armors.chestplate;
        if (armors.leggings !== undefined) this.leggings = armors.leggings;
        if (armors.boots !== undefined) this.boots = armors.boots;
        this.getRenderingTrait().updateArmorForViewers([]);
    }
    getArmor(who: "helmet" | "chestplate" | "leggings" | "boots"): ItemStack {
        switch (who) {
            case "helmet": return this.helmet;
            case "chestplate": return this.chestplate;
            case "leggings": return this.leggings;
            case "boots": return this.boots;
        }
    }
    getSkin(): SerializedSkin {
        const skin = SerializedSkin.empty();
        const CompoundTagSkin = this.entity.getStorageEntry<CompoundTag>("SlapperSkin");
        if (CompoundTagSkin) {
            skin.identifier = CompoundTagSkin.get<StringTag>("Identifier")?.valueOf() || skin.identifier;
            skin.playFabIdentifier = CompoundTagSkin.get<StringTag>("PlayFabIdentifier")?.valueOf() || skin.playFabIdentifier;
            const width = CompoundTagSkin.get<IntTag>("SkinImageWidth")?.valueOf() || 0;
            const height = CompoundTagSkin.get<IntTag>("SkinImageHeight")?.valueOf() || 0;
            const bufferBase64 = CompoundTagSkin.get<StringTag>("SkinImageData")?.valueOf() || "";
            skin.skinImage = new SkinImage(width, height, Buffer.from(bufferBase64, 'base64'));
            skin.skinColor = CompoundTagSkin.get<StringTag>("SkinColor")?.valueOf() || skin.skinColor;
            skin.armSize = CompoundTagSkin.get<StringTag>("ArmSize")?.valueOf() || skin.armSize;
            skin.resourcePatch = CompoundTagSkin.get<StringTag>("ResourcePatch")?.valueOf() || skin.resourcePatch;
            skin.geometryData = CompoundTagSkin.get<StringTag>("GeometryData")?.valueOf() || skin.geometryData;
            skin.geometryVersion = CompoundTagSkin.get<StringTag>("GeometryVersion")?.valueOf() || skin.geometryVersion;
            skin.fullIdentifier = CompoundTagSkin.get<StringTag>("FullIdentifier")?.valueOf() || skin.fullIdentifier;
        }
        return skin;
    }
    setSkin(skin: SerializedSkin): void {
        this.skin = skin;
        const data = {
            identifier: this.skin.identifier,
            armSize: this.skin.armSize,
            width: this.skin.skinImage.width,
            height: this.skin.skinImage.height,
            buffer: this.skin.skinImage.data.toString('base64'),
            color: this.skin.skinColor,
            playFabIdentifier: this.skin.playFabIdentifier,
            recourcePatch: this.skin.resourcePatch,
            geometryData: this.skin.geometryData,
            geometryVersion: this.skin.geometryVersion,
            fullIdentifier: this.skin.fullIdentifier
        }
        const CompoundTagSkin = new CompoundTag();
        CompoundTagSkin.set("Identifier", new StringTag(data.identifier, "Identifier"));
        CompoundTagSkin.set("PlayFabIdentifier", new StringTag(data.playFabIdentifier, "PlayFabIdentifier"));
        CompoundTagSkin.set("SkinImageWidth", new IntTag(data.width, "SkinImageWidth"));
        CompoundTagSkin.set("SkinImageHeight", new IntTag(data.height, "SkinImageHeight"));
        CompoundTagSkin.set("SkinImageData", new StringTag(data.buffer, "SkinImageData"));
        CompoundTagSkin.set("SkinColor", new StringTag(data.color, "SkinColor"));
        CompoundTagSkin.set("ArmSize", new StringTag(data.armSize, "ArmSize"));
        CompoundTagSkin.set("ResourcePatch", new StringTag(data.recourcePatch, "ResourcePatch"));
        CompoundTagSkin.set("GeometryData", new StringTag(data.geometryData, "GeometryData"));
        CompoundTagSkin.set("GeometryVersion", new StringTag(data.geometryVersion, "GeometryVersion"));
        CompoundTagSkin.set("FullIdentifier", new StringTag(data.fullIdentifier, "FullIdentifier"));
        this.entity.setStorageEntry("SlapperSkin", CompoundTagSkin);
        this.getRenderingTrait().updateSkinForViewers([]);

    }
    onInteract(player: Player, method: EntityInteractMethod) {

        for (const command of this.getCommands()) {
            try {
                if (command.includes("@p")) {
                    const replacedCommand = command.replace(/@p/g, player.username);
                    player.dimension.executeCommand(replacedCommand);
                } else {
                    player.executeCommand(command);
                }

            } catch (e) {
                log("Error executing slapper commands: " + command);
            }
        }
    }
    getRenderingTrait(): SlapperRederingTrait {
        return this.entity.getTrait(SlapperRederingTrait) ?? this.entity.addTrait(SlapperRederingTrait);
    }
    public getSavedPosition(): Vector3f {
        // Check if the position tag exists
        const position = this.entity.getStorageEntry<ListTag<FloatTag>>("Pos");

        // If it exists, return its value as a Vector3f
        if (position) {
            // Get the values from the ListTag
            const elements = [...position.values()] as [FloatTag, FloatTag, FloatTag];

            // Get the x, y, and z coordinates from the elements
            const x = elements[0].valueOf();
            const y = elements[1].valueOf();
            const z = elements[2].valueOf();

            // Create a new Vector3f instance
            const vector = new Vector3f(x, y, z);



            // Return the Vector3f instance
            return vector;
        } else {
            throw new Error("Entity position not found in level storage.");
        }
    }
    static createPreStorage(position: Vector3f, skin: SerializedSkin, displayName: string, uuid: string, id: number, commands: string[], rotation: Rotation): CompoundTag {
        const storage = new CompoundTag();
        storage.set("identifier", new StringTag("slapper_entity_type", "identifier"));
        storage.set("UniqueID", new LongTag(BigInt(id), "UniqueID"));
        storage.set("SlapperUUID", new StringTag(uuid, "SlapperUUID"));
        storage.set("SlapperID", new IntTag(id, "SlapperID"));
        storage.set("SlapperDisplayName", new StringTag(displayName, "SlapperDisplayName"));
        storage.set("SlapperCommands", new StringTag(commands.join(","), "SlapperCommands"));
        const skinTag = new CompoundTag();
        skinTag.set("Identifier", new StringTag(skin.identifier, "Identifier"));
        skinTag.set("PlayFabIdentifier", new StringTag(skin.playFabIdentifier, "PlayFabIdentifier"));
        skinTag.set("SkinImageWidth", new IntTag(skin.skinImage.width, "SkinImageWidth"));
        skinTag.set("SkinImageHeight", new IntTag(skin.skinImage.height, "SkinImageHeight"));
        skinTag.set("SkinImageData", new StringTag(skin.skinImage.data.toString('base64'), "SkinImageData"));
        skinTag.set("SkinColor", new StringTag(skin.skinColor, "SkinColor"));
        skinTag.set("ArmSize", new StringTag(skin.armSize, "ArmSize"));
        skinTag.set("ResourcePatch", new StringTag(skin.resourcePatch, "ResourcePatch"));
        skinTag.set("GeometryData", new StringTag(skin.geometryData, "GeometryData"));
        skinTag.set("GeometryVersion", new StringTag(skin.geometryVersion, "GeometryVersion"));
        skinTag.set("FullIdentifier", new StringTag(skin.fullIdentifier, "FullIdentifier"));

        storage.set("SlapperSkin", skinTag);
        const posTag = new ListTag<FloatTag>(
            [
                new FloatTag(position.x),
                new FloatTag(position.y),
                new FloatTag(position.z)
            ],
            "Pos"
        );

        // Set the Pos tag in the storage
        storage.set("Pos", posTag);
        const rotTag = new ListTag<FloatTag>(
            [new FloatTag(rotation.yaw), new FloatTag(rotation.pitch)],
            "Rotation"
        );
        storage.set("Rotation", rotTag);
        return storage;
    }
    onAdd(): void {
        if (!(this.entity instanceof SlapperEntity) && !(this.entity.type.identifier === ("slapper_entity_type" as EntityIdentifier))) {
            this.entity.removeTrait(this.identifier);
            return;
        }
        for (const trait of [EntityEquipmentTrait, EntityNameableTrait]) {
            this.entity.addTrait(trait);
        }
        this.entity.setNametag(this.getDisplayName());
        this.entity.setNametagAlwaysVisible(true);

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

}