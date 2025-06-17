import { File } from "../models/File";
import { User, UserAttributes } from "../models/User";
import { Op } from "sequelize";
import { RequestHandler } from "express";
import { AppError } from "../middleware/error.middleware";
import { sequelize } from "../config/database";

interface CreateUserRequest {
  username: string;
  password: string;
  isAdmin?: boolean;
}

interface UpdateUserRequest {
  username?: string;
  isAdmin?: boolean;
}

export class AdminController {
  public getUsers: RequestHandler = async (req, res) => {
    const users = await User.findAll({
      attributes: ["id", "username", "isAdmin", "createdAt"],
    });
    res.json(users);
  };

  public createUser: RequestHandler<{}, {}, CreateUserRequest> = async (
    req,
    res,
  ) => {
    const { username, password, isAdmin } = res.locals.user;

    if (!username || !password) {
      throw new AppError(400, "Username and password are required");
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new AppError(400, "Username already exists");
    }

    const user = await User.create({
      username,
      password,
      isAdmin: isAdmin || false,
    } as UserAttributes);

    res.status(201).json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  };

  public updateUser: RequestHandler<{ id: string }, {}, UpdateUserRequest> =
    async (req, res) => {
      const { id } = req.params;
      const { username, isAdmin } = res.locals.user;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError(404, "User not found");
      }

      // Prevent removing the last admin
      if (user.isAdmin && !isAdmin) {
        const adminCount = await User.count({ where: { isAdmin: true } });
        if (adminCount <= 1) {
          throw new AppError(400, "Cannot remove the last admin");
        }
      }

      await user.update({
        username: username || user.username,
        isAdmin: isAdmin !== undefined ? isAdmin : user.isAdmin,
      });

      res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      });
    };

  public deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Prevent deleting the last admin
    if (user.isAdmin) {
      const adminCount = await User.count({ where: { isAdmin: true } });
      if (adminCount <= 1) {
        throw new AppError(400, "Cannot delete the last admin");
      }
    }

    await user.destroy();
    res.status(204).send();
  };

  public getStats: RequestHandler = async (req, res) => {
    const [userStats, fileStats] = await Promise.all([
      User.findAll({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "totalUsers"],
          [
            sequelize.fn(
              "COUNT",
              sequelize.literal('CASE WHEN "isAdmin" = true THEN 1 END'),
            ),
            "adminCount",
          ],
        ],
      }),
      File.findAll({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "totalFiles"],
          [sequelize.fn("SUM", sequelize.col("size")), "totalSize"],
          "type",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["type"],
      }),
    ]);

    res.json({
      users: userStats[0],
      files: fileStats,
    });
  };

  public getLogs: RequestHandler = async (req, res) => {
    const { startDate, endDate, type } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    if (type) {
      where.type = type;
    }

    const logs = await File.findAll({
      attributes: [
        "id",
        "type",
        "name",
        "size",
        "createdAt",
      ],
      where,
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    res.json(logs);
  };
}

