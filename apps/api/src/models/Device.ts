import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface DeviceAttributes {
  id: string;
  clientId: string;
  hostname: string;
  type:
    | "workstation"
    | "server"
    | "printer"
    | "firewall"
    | "switch"
    | "access_point"
    | "ups"
    | null;
  os: string | null;
  ipAddress: string | null;
  macAddress: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  status: "online" | "offline" | "degraded" | "maintenance";
  lastSeenAt: Date | null;
  warrantyExpiry: Date | null;
  purchasedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DeviceCreationAttributes = Optional<
  DeviceAttributes,
  | "id"
  | "type"
  | "os"
  | "ipAddress"
  | "macAddress"
  | "manufacturer"
  | "model"
  | "serialNumber"
  | "status"
  | "lastSeenAt"
  | "warrantyExpiry"
  | "purchasedAt"
  | "createdAt"
  | "updatedAt"
>;

export class Device
  extends Model<DeviceAttributes, DeviceCreationAttributes>
  implements DeviceAttributes
{
  declare id: string;
  declare clientId: string;
  declare hostname: string;
  declare type:
    | "workstation"
    | "server"
    | "printer"
    | "firewall"
    | "switch"
    | "access_point"
    | "ups"
    | null;
  declare os: string | null;
  declare ipAddress: string | null;
  declare macAddress: string | null;
  declare manufacturer: string | null;
  declare model: string | null;
  declare serialNumber: string | null;
  declare status: "online" | "offline" | "degraded" | "maintenance";
  declare lastSeenAt: Date | null;
  declare warrantyExpiry: Date | null;
  declare purchasedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Device {
    Device.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        clientId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        hostname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM(
            "workstation",
            "server",
            "printer",
            "firewall",
            "switch",
            "access_point",
            "ups",
          ),
          allowNull: true,
        },
        os: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ipAddress: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        macAddress: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        manufacturer: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        model: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "device_model",
        },
        serialNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("online", "offline", "degraded", "maintenance"),
          defaultValue: "online",
        },
        lastSeenAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        warrantyExpiry: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        purchasedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "devices",
        underscored: true,
        indexes: [
          { fields: ["client_id"] },
        ],
      },
    );
    return Device;
  }
}
