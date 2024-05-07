const { Model, DataTypes } = require('sequelize');

const TICKET_TABLE = 'ticket';

class Ticket extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: TICKET_TABLE,
      modelName: 'Ticket',
      timestamps: false
    };
  }
}

const TicketSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  message: {
    type: DataTypes.STRING(800),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Completed', 'Rejected', 'Pending'),
    allowNull: false
  }
};

module.exports = { Ticket, TicketSchema };
