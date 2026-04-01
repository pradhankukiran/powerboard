import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface TicketAttributes {
  id: string;
  ticketNumber: string;
  clientId: string;
  assignedToId: string | null;
  deviceId: string | null;
  subject: string;
  description: string | null;
  priority: "critical" | "high" | "medium" | "low";
  status:
    | "open"
    | "in_progress"
    | "waiting_on_client"
    | "escalated"
    | "resolved"
    | "closed";
  category:
    | "hardware"
    | "software"
    | "network"
    | "security"
    | "email"
    | "printing"
    | "onboarding"
    | "other"
    | null;
  source: "phone" | "email" | "portal" | "monitoring" | "walk_in";
  responseTimeMinutes: number | null;
  resolutionTimeMinutes: number | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TicketCreationAttributes = Optional<
  TicketAttributes,
  | "id"
  | "assignedToId"
  | "deviceId"
  | "description"
  | "status"
  | "category"
  | "source"
  | "responseTimeMinutes"
  | "resolutionTimeMinutes"
  | "resolvedAt"
  | "closedAt"
  | "createdAt"
  | "updatedAt"
>;

export class Ticket
  extends Model<TicketAttributes, TicketCreationAttributes>
  implements TicketAttributes
{
  declare id: string;
  declare ticketNumber: string;
  declare clientId: string;
  declare assignedToId: string | null;
  declare deviceId: string | null;
  declare subject: string;
  declare description: string | null;
  declare priority: "critical" | "high" | "medium" | "low";
  declare status:
    | "open"
    | "in_progress"
    | "waiting_on_client"
    | "escalated"
    | "resolved"
    | "closed";
  declare category:
    | "hardware"
    | "software"
    | "network"
    | "security"
    | "email"
    | "printing"
    | "onboarding"
    | "other"
    | null;
  declare source: "phone" | "email" | "portal" | "monitoring" | "walk_in";
  declare responseTimeMinutes: number | null;
  declare resolutionTimeMinutes: number | null;
  declare resolvedAt: Date | null;
  declare closedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Ticket {
    Ticket.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        ticketNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        clientId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        assignedToId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        deviceId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        subject: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        priority: {
          type: DataTypes.ENUM("critical", "high", "medium", "low"),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            "open",
            "in_progress",
            "waiting_on_client",
            "escalated",
            "resolved",
            "closed",
          ),
          defaultValue: "open",
        },
        category: {
          type: DataTypes.ENUM(
            "hardware",
            "software",
            "network",
            "security",
            "email",
            "printing",
            "onboarding",
            "other",
          ),
          allowNull: true,
        },
        source: {
          type: DataTypes.ENUM(
            "phone",
            "email",
            "portal",
            "monitoring",
            "walk_in",
          ),
          defaultValue: "portal",
        },
        responseTimeMinutes: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        resolutionTimeMinutes: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        resolvedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        closedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "tickets",
        underscored: true,
      },
    );
    return Ticket;
  }
}
