import { EntityDespawnOptions, EntityIdentifier, EntityTrait, ItemStack, Player, PlayerAbilities, PlayerChunkRenderingTrait, TraitOnTickDetails } from "@serenityjs/core";
import { log } from "console";
import { ActorDataId, ActorDataType, AddPlayerPacket, CommandPermissionLevel, DataItem, DeviceOS, Gamemode, MobArmorEquipmentPacket, MobEquipmentPacket, NetworkItemStackDescriptor, PermissionLevel, PlayerSkinPacket, RemoveEntityPacket, SetActorDataPacket } from "@serenityjs/protocol";
import { SlapperEntityTrait } from "./SlapperEntityTrait";
import { SlapperEntityTypes } from "../entity/SlapperEntityTypes";

export class SlapperRederingTrait extends EntityTrait {

  identifier: string = "slapper_rendering_trait";
  static identifier: string = "slapper_rendering_trait";

  static readonly types: Array<EntityIdentifier> = [
    SlapperEntityTypes.SLAPPER_HUMAN_ENTITY_TYPE
  ];
  protected viewers: Map<bigint, Player> = new Map();

  public addViewer(viewer: Player): void {
    if (this.hasViewer(viewer) || !viewer.isAlive || !viewer.isTicking) return;
    this.viewers.set(viewer.uniqueId, viewer);
    this.spawnToViewer(viewer);
  }
  public removeViewer(viewer: Player): void {
    this.despawnFromViewer(viewer);
    this.viewers.delete(viewer.uniqueId);
  }
  public hasViewer(viewer: Player): boolean {
    return this.viewers.has(viewer.uniqueId);
  }
  protected spawnToViewer(viewer: Player): void {
    this.despawnFromViewer(viewer);
    const packet = new AddPlayerPacket();
    const sp = this.getSlapperEntityTrait();
    const entity = this.entity;
    packet.uuid = sp.getUuid();
    packet.username = sp.getDisplayName();
    packet.runtimeId = this.entity.runtimeId;
    packet.platformChatId = String();
    packet.position = sp.getSavedPosition() ?? entity.position;
    packet.velocity = entity.velocity;
    packet.pitch = entity.rotation.pitch;
    packet.yaw = entity.rotation.yaw;
    packet.headYaw = entity.rotation.headYaw;
    packet.heldItem =
      sp.getItemInHand() === null
        ? new NetworkItemStackDescriptor(0)
        : ItemStack.toNetworkStack(sp.getItemInHand());
    packet.gamemode = Gamemode.Creative;
    packet.data = entity.metadata.getAllActorMetadataAsDataItems();
    packet.properties =
      entity.sharedProperties.getSharedPropertiesAsSyncData();
    packet.uniqueEntityId = entity.uniqueId;
    packet.premissionLevel = PermissionLevel.Operator;

    packet.commandPermission = CommandPermissionLevel.Normal;

    packet.abilities = [];
    packet.links = [];
    const clientSystemInfo = {
      identifier: "unknown",
      os: DeviceOS.Android,
    };
    packet.deviceId = clientSystemInfo.identifier;
    packet.deviceOS = clientSystemInfo.os;
    setTimeout(() => {
      viewer.sendImmediate(packet);
      setTimeout(() => this.updateAllForViewers([viewer]), 200);
    }, 200);
  }
  protected despawnFromViewer(viewer: Player): void {
    const entity = this.entity;
    const packet = new RemoveEntityPacket();
    packet.uniqueEntityId = entity.uniqueId;
    viewer.sendImmediate(packet);
  }
  updateAllForViewers(viewers: Player[]): void {
    this.updateSkinForViewers(viewers);
    this.updateItemInHandForViewers(viewers);
    this.updateArmorForViewers(viewers);
  }
  onDespawn(details: EntityDespawnOptions): void {
    this.despawnForAllViewers();
  }
  onRemove(): void {
    this.despawnForAllViewers();
  }
  /**
   * This will be removed in future updates. but now it works as a quick fix for updating display name.
   */
  public updateDisplayName(): void {
    for (const viewer of this.viewers.values()) {
      this.despawnFromViewer(viewer);
      setTimeout(() => {
        this.spawnToViewer(viewer);
      }, 200);

    }

  }
  updateSkinForViewers(viewers: Player[]): void {
    const entity = this.entity;
    const sp = this.getSlapperEntityTrait();
    const skin = sp.getSkin();
    const pk = new PlayerSkinPacket();
    pk.skin = skin
    pk.uuid = sp.getUuid();
    pk.skinName = skin.identifier;
    pk.oldSkinName = skin.identifier + "_old";
    pk.isVerified = true;
    const all = viewers.length >= 1 ? viewers : Array.from(this.viewers.values());
    this.dimension.broadcast(pk);
  }
  updateItemInHandForViewers(viewers: Player[]): void {
    const entity = this.entity
    const sp = this.getSlapperEntityTrait();
    const itemInHand = sp.getItemInHand();

    const all = viewers.length >= 1 ? viewers : Array.from(this.viewers.values());
  }
  updateArmorForViewers(viewers: Player[]): void {
    const entity = this.entity

    const armor = new MobArmorEquipmentPacket();
    armor.runtimeId = entity.runtimeId;
    const sp = this.getSlapperEntityTrait();
    armor.helmet = ItemStack.toNetworkStack(sp.getArmor("helmet"));
    armor.chestplate = ItemStack.toNetworkStack(sp.getArmor("chestplate"));
    armor.leggings = ItemStack.toNetworkStack(sp.getArmor("leggings"));
    armor.boots = ItemStack.toNetworkStack(sp.getArmor("boots"));
    armor.body = ItemStack.toNetworkStack(ItemStack.empty());
    const all = viewers.length >= 1 ? viewers : Array.from(this.viewers.values());
    for (const viewer of all) {
      viewer.send(armor);
    }
  }

  getSlapperEntityTrait() {
    return this.entity.getTrait(SlapperEntityTrait) ?? this.entity.addTrait(SlapperEntityTrait);
  }
  onAdd(): void {
    if (!(this.entity.identifier === SlapperEntityTypes.SLAPPER_HUMAN_ENTITY_TYPE)) {
      this.entity.removeTrait(this.identifier);
      return;
    }
    this.dimension.entities.set(this.entity.uniqueId, this.entity);
    this.entity.isAlive = true;
  }
  respawnForAllViewers(): void {
    for (const viewer of this.viewers.values()) {
      this.despawnFromViewer(viewer);
      setTimeout(() => {
        this.spawnToViewer(viewer);
      }, 500);
    }
  }
  despawnForAllViewers(): void {
    for (const viewer of this.viewers.values()) {
      this.despawnFromViewer(viewer);
    }
    this.viewers.clear();
  }
  defaultViewDistance: number = 35;

  // public verificationInterval: number = 2;
  public onTick(details: TraitOnTickDetails): void {

    if (details.currentTick % 20n !== 0n) {
      return;
    }
    //if (this.verificationInterval > 0) {
    //   this.verificationInterval--;
    //   return;
    // }
    // this.verificationInterval = 2;

    for (const player of this.dimension.getPlayers()) {
      if (this.entity.position.distance(player.position) > this.defaultViewDistance) continue;
      this.addViewer(player);
    }
    for (const viewer of this.viewers.values()) {
      if (!viewer.isAlive || !viewer.isTicking || this.dimension.entities.has(this.entity.uniqueId) === false) {
        this.removeViewer(viewer);
      }

      if (this.entity.position.distance(viewer.position) > this.defaultViewDistance) {
        this.removeViewer(viewer);
      }
    }
  }
}