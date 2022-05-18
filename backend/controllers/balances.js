const Histo = require("../models/Histo");
const LastBalance = require("../models/LastBalance");
const Balance = require("./Objects/Balance");
const Prices = require("./Objects/Prices");

exports.getAllBalances = async (req, res, next) => {
  let last_balance = await LastBalance.find();
  let balance = new Balance(JSON.parse(JSON.stringify(last_balance[0])));
  balance
    .fetchAll()
    .then(async () => {
      balance.get_evolution();
      await Promise.all([
        balance.get_composition(),
        createHisto(balance.balance_tot.total_usd),
      ]);

      res.status(200).json({
        total_usd: balance.balance_tot.total_usd,
        balances: balance.balance_tot.balances,
        composition: balance.composition,
        debt: balance.debt,
      });
      LastBalance.updateOne(
        {},
        {
          $set: {
            balances: balance.balance_tot.balances,
            last_updated: balance.balance_tot.last_updated,
            lp_list: balance.balance_tot.lp_list,
            total_usd: balance.balance_tot.total_usd,
          },
        }
      ).then(() => console.log("LastBalance actualisée"));
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};
async function createHisto(total_usd) {
  let today = new Date().setHours(0, 0, 0, 0);
  Histo.findOne({ day: today }).then(async (h) => {
    let prices_accessor = new Prices();
    let [bitcoin_price, ethereum_price] = [0, 0];
    await Promise.all([
      (bitcoin_price = await prices_accessor.get_price_cg("bitcoin")),
      (ethereum_price = await prices_accessor.get_price_cg("ethereum")),
    ]);
    let balance_eth = total_usd / ethereum_price.ethereum.usd;
    let balance_btc = total_usd / bitcoin_price.bitcoin.usd;

    if (h) {
      Histo.updateOne(
        { day: today },
        {
          $set: {
            balance: total_usd,
            balance_eth: balance_eth,
            balance_btc: balance_btc,
          },
        }
      ).then(() => console.log("Historique du jour actualisé"));
    } else {
      const histo = new Histo({
        day: today,
        balance: total_usd,
        balance_eth: balance_eth,
        balance_btc: balance_btc,
      });
      histo.save();
    }
  });
}
