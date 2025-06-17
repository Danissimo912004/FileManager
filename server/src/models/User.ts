import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';

export interface UserAttributes {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public password!: string;
  public isAdmin!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    hooks: {
      beforeSave: async (user: UserModel) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export const User = UserModel; 
