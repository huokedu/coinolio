const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const APIError = ('../utils/errors').APIError;

const Trade = db.Model.extend({
  tableName: 'trades',
  idAttribute: 'tran_id',
  hasTimestamps: false
}, {
  /**
   * Get trade
   * @param {string} id - The ID of trade.
   * @return {Promise}
   */
  get(id) {
    return Trade.findById(id,
      {
        require: true
      })
      .then((trade) => {
        if (trade) {
          trade = trade.toJSON({omitPivot: true});
          return trade;
        }
        const err = new APIError(
          'No such trade exists!',
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  bulkCreate(data) {
    return db.knex
      .insert(data)
      .into('trades');
  }
});

const Trades = db.Collection.extend({
  model: Trade
}, {
  /**
   * List trades in descending order of 'created_at' timestamp.

   * @return {Promise}
   */
  list() {
    return Trades
      .query((qb) => {
        qb
          .select();
      })
      .orderBy('datetime', 'DESC')
      .fetch();
  },

  /**
   * List trades in descending order of 'created_at' timestamp for a certain cryptocurrency.
   *
   * @param {string} symbol - The symbol of the cryptocurrency
   * @return {Promise}
   */
  listBySymbol(symbol) {
    return Trades
      .query((qb) => {
        qb
          .where('symbolBuy', '=', symbol)
          .orWhere('symbolSell', '=', symbol);
      })
      .orderBy('datetime', 'DESC')
      .fetch();
  },

  /**
   * Fetch last trade stored.
   *
   * @return {Promise}
   */
  lastUpdate() {
    return Trade
      .query((qb) => {
        qb
          .select();
      })
      .orderBy('datetime', 'DESC')
      .fetch({columns: ['datetime']});
  }
});

module.exports = {
  Trade: db.model('Trade', Trade),
  Trades: db.collection('Trades', Trades)
};
