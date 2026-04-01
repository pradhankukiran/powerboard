import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface TechnicianAttributes {
  id: string;
  userId: string;
  specializations: string[] | null;
  ticketsResolvedThisMonth: number;
  avgResolutionMinutes: number | null;
  satisfactionScore: number | null;
  isOnCall: boolean;
  hireDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TechnicianCreationAttributes = Optional<
  TechnicianAttributes,
  | "id"
  | "specializations"
  | "ticketsResolvedThisMonth"
  | "avgResolutionMinutes"
  | "satisfactionScore"
  | "isOnCall"
  | "hireDate"
  | "createdAt"
  | "updatedAt"
>;

export class Technician
  extends Model<TechnicianAttributes, TechnicianCreationAttributes>
  implements TechnicianAttributes
{
  declare id: string;
  declare userId: string;
  declare specializations: string[] | null;
  declare ticketsResolvedThisMonth: number;
  declare avgResolutionMinutes: number | null;
  declare satisfactionScore: number | null;
  declare isOnCall: boolean;
  declare hireDate: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Technician {
    Technician.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
        },
        specializations: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
        ticketsResolvedThisMonth: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        avgResolutionMinutes: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        satisfactionScore: {
          type: DataTypes.DECIMAL(3, 2),
          allowNull: true,
        },
        isOnCall: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        hireDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "technicians",
        underscored: true,
      },
    );
    return Technician;
  }
}
