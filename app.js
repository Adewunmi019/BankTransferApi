const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const mongoose = require("mongoose");
const bodyParser = require("body-Parser");
const { Transaction, openAccount } = require("./validate");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/bankTransfer", {
  useNewUrlParser: true,
});

var accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);
var date = new Date().toLocaleString();
console.log(`request received at ${date}`);

const balanceSchema = new mongoose.Schema({
  accountNumber: Number,
  fullName: String,
  Balance: Number,
  createAt: String,
});

const transactionSchema = new mongoose.Schema({
  senderName: String,
  senderAccount: Number,
  amount: Number,
  receiverName: String,
  receiverAccount: Number,
  narration: String,
  createAt: String,
});

const Balance = mongoose.model("balance", balanceSchema);
const Transactions = mongoose.model("transaction", transactionSchema);

app.post("/createAccount", (req, res) => {
  const { error, value } = openAccount(req.body);
  if (error) {
    res.status(400).json(error);
  } else {
    try {
      const balance = new Balance({
        accountNumber: accountNumber,
        fullName: value.fullName,
        Balance: value.Balance,
        createAt: date,
      });
      balance.save().then(() => {
        res.send("Account creation was successful");
      });
      res
        .status(200)
        .send(`Account created. Your account number is ${accountNumber}`);
    } catch (error) {
      res.status(400).json(error);
    }
  }
});
app.get("/balance/:accountNumber", async (req, res) => {
  try {
    const perBalance = await Balance.findOne({
      accountNumber: req.body.accountNumber,
    });
    res.send(perBalance);
  } catch (error) {}
});

app.get("/balance", async (req, res) => {
  try {
    const results = await Balance.find({});
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
  }
});

app.post("/transfer", async (req, res) => {
  const { error, value } = Transaction(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  var deposit = value.amount;
  var senderAcctNo = value.senderAccount;
  var Narration = value.Narration;
  var receiverAccount = value.receiverAccount;
  var senderBalance,
    receiverBalance = 0;
  let SenderName, ReceiverName;
  try {
    const senderAccnt = await Balance.find(
      { accountNumber: senderAcctNo },
      "fullName Balance -_id"
    ).exec();

    const recieverAcct = await Balance.find(
      { accountNumber: receiverAccount },
      "fullName Balance -_id"
    ).exec();

    // fetching the balance

    senderAccnt.forEach((item) => {
      senderBalance = item.Balance;
      SenderName = item.fullName;
    });
    recieverAcct.forEach((item) => {
      ReceiverName = item.fullName;
      receiverBalance = item.Balance;
    });

    // deducting amount in account holder's bank

    if (senderBalance >= deposit) {
      senderBalance -= deposit;
      receiverBalance += deposit;

      // updating the sender and receiver balances

      await Balance.updateOne(
        { accountNumber: senderAcctNo },
        { $set: { Balance: senderBalance } }
      );

      await Balance.updateOne(
        { accountNumber: receiverAccount },
        { $set: { Balance: receiverBalance } }
      );

      //creating transaction collection

      const trans = new Transactions({
        // reference: referenceNo,
        senderName: SenderName,
        senderAccount: senderAcctNo,
        amount: deposit,
        receiverName: ReceiverName,
        receiverAccount: receiverAccount,
        narration: Narration,
        createAt: Date(),
      });

      trans.save().then(() => {
        console.log("Transfer done");
      });

      res.status(200).send(`Transfer done succesfully.`);
    } else {
      res.send("Insufficient Balance");
    }
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
