import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface PrintJobAttributes {
  id: string;
  deviceId: string;
  clientId: string;
  userId: string | null;
  documentName: string | null;
  pages: number;
  colorPages: number;
  duplexPages: number;
  status: "completed" | "failed" | "cancelled";
  costEstimate: number | null;
  printerName: string | null;
  submittedAt: Date | null;
  completedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PrintJobCreationAttributes = Optional<
  PrintJobAttributes,
  | "id"
  | "userId"
  | "documentName"
  | "colorPages"
  | "duplexPages"
  | "costEstimate"
  | "printerName"
  | "submittedAt"
  | "completedAt"
  | "createdAt"
  | "updatedAt"
>;

export class PrintJob
  extends Model<PrintJobAttributes, PrintJobCreationAttributes>
  implements PrintJobAttributes
{
  declare id: string;
  declare deviceId: string;
  declare clientId: string;
  declare userId: string | null;
  declare documentName: string | null;
  declare pages: number;
  declare colorPages: number;
  declare duplexPages: number;
  declare status: "completed" | "failed" | "cancelled";
  declare costEstimate: number | null;
  declare printerName: string | null;
  declare submittedAt: Date | null;
  declare completedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof PrintJob {
    PrintJob.init(
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
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        documentName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        pages: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        colorPages: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        duplexPages: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM("completed", "failed", "cancelled"),
          allowNull: false,
        },
        costEstimate: {
          type: DataTypes.DECIMAL(8, 2),
          allowNull: true,
        },
        printerName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        submittedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "print_jobs",
        underscored: true,
      },
    );
    return PrintJob;
  }
}
