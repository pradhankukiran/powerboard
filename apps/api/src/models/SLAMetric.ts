import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface SLAMetricAttributes {
  id: string;
  clientId: string;
  date: string;
  uptimePercent: number | null;
  avgResponseMinutes: number | null;
  avgResolutionMinutes: number | null;
  ticketsOpened: number | null;
  ticketsClosed: number | null;
  breachCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SLAMetricCreationAttributes = Optional<
  SLAMetricAttributes,
  | "id"
  | "uptimePercent"
  | "avgResponseMinutes"
  | "avgResolutionMinutes"
  | "ticketsOpened"
  | "ticketsClosed"
  | "breachCount"
  | "createdAt"
  | "updatedAt"
>;

export class SLAMetric
  extends Model<SLAMetricAttributes, SLAMetricCreationAttributes>
  implements SLAMetricAttributes
{
  declare id: string;
  declare clientId: string;
  declare date: string;
  declare uptimePercent: number | null;
  declare avgResponseMinutes: number | null;
  declare avgResolutionMinutes: number | null;
  declare ticketsOpened: number | null;
  declare ticketsClosed: number | null;
  declare breachCount: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof SLAMetric {
    SLAMetric.init(
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
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        uptimePercent: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: true,
        },
        avgResponseMinutes: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        avgResolutionMinutes: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        ticketsOpened: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        ticketsClosed: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        breachCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: "sla_metrics",
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ["client_id", "date"],
          },
        ],
      },
    );
    return SLAMetric;
  }
}
