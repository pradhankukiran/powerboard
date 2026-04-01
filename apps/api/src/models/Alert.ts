import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface AlertAttributes {
  id: string;
  deviceId: string;
  clientId: string;
  type:
    | "cpu_high"
    | "memory_high"
    | "disk_full"
    | "offline"
    | "service_down"
    | "security_threat"
    | "backup_failed"
    | "certificate_expiring"
    | "temperature_high";
  severity: "critical" | "warning" | "info";
  message: string;
  isAcknowledged: boolean;
  acknowledgedById: string | null;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AlertCreationAttributes = Optional<
  AlertAttributes,
  | "id"
  | "isAcknowledged"
  | "acknowledgedById"
  | "acknowledgedAt"
  | "resolvedAt"
  | "createdAt"
  | "updatedAt"
>;

export class Alert
  extends Model<AlertAttributes, AlertCreationAttributes>
  implements AlertAttributes
{
  declare id: string;
  declare deviceId: string;
  declare clientId: string;
  declare type:
    | "cpu_high"
    | "memory_high"
    | "disk_full"
    | "offline"
    | "service_down"
    | "security_threat"
    | "backup_failed"
    | "certificate_expiring"
    | "temperature_high";
  declare severity: "critical" | "warning" | "info";
  declare message: string;
  declare isAcknowledged: boolean;
  declare acknowledgedById: string | null;
  declare acknowledgedAt: Date | null;
  declare resolvedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Alert {
    Alert.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        deviceId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        clientId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM(
            "cpu_high",
            "memory_high",
            "disk_full",
            "offline",
            "service_down",
            "security_threat",
            "backup_failed",
            "certificate_expiring",
            "temperature_high",
          ),
          allowNull: false,
        },
        severity: {
          type: DataTypes.ENUM("critical", "warning", "info"),
          allowNull: false,
        },
        message: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isAcknowledged: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        acknowledgedById: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        acknowledgedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        resolvedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "alerts",
        underscored: true,
      },
    );
    return Alert;
  }
}
