import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface ClientAttributes {
  id: string;
  name: string;
  industry:
    | "healthcare"
    | "finance"
    | "education"
    | "manufacturing"
    | "legal"
    | "retail"
    | "technology"
    | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  slaLevel: "platinum" | "gold" | "silver" | "bronze";
  monthlyRetainer: number | null;
  deviceCount: number;
  isActive: boolean;
  onboardedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClientCreationAttributes = Optional<
  ClientAttributes,
  | "id"
  | "industry"
  | "contactEmail"
  | "contactPhone"
  | "address"
  | "city"
  | "state"
  | "monthlyRetainer"
  | "deviceCount"
  | "isActive"
  | "onboardedAt"
  | "createdAt"
  | "updatedAt"
>;

export class Client
  extends Model<ClientAttributes, ClientCreationAttributes>
  implements ClientAttributes
{
  declare id: string;
  declare name: string;
  declare industry:
    | "healthcare"
    | "finance"
    | "education"
    | "manufacturing"
    | "legal"
    | "retail"
    | "technology"
    | null;
  declare contactEmail: string | null;
  declare contactPhone: string | null;
  declare address: string | null;
  declare city: string | null;
  declare state: string | null;
  declare slaLevel: "platinum" | "gold" | "silver" | "bronze";
  declare monthlyRetainer: number | null;
  declare deviceCount: number;
  declare isActive: boolean;
  declare onboardedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Client {
    Client.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        industry: {
          type: DataTypes.ENUM(
            "healthcare",
            "finance",
            "education",
            "manufacturing",
            "legal",
            "retail",
            "technology",
          ),
          allowNull: true,
        },
        contactEmail: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        contactPhone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        state: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        slaLevel: {
          type: DataTypes.ENUM("platinum", "gold", "silver", "bronze"),
          allowNull: false,
        },
        monthlyRetainer: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        deviceCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        onboardedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "clients",
        underscored: true,
      },
    );
    return Client;
  }
}
