const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const mongoose = require("mongoose");
const bodyParser = require("body-Parser");
const { openAccount } = require("./validate");

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
})

const Balance = mongoose.model('balance', balanceSchema)



app.post("/createAccount", (req, res) => {
const {error, value} = openAccount(req.body)
if(error){
    res.status(400).json(error)
}else {
    try {
        const balance = new Balance({
            accountNumber: accountNumber,
            fullName: value.fullName,
            Balance: value.Balance,
            createAt: date,
        })
        balance.save().then(() =>{
            res.send('Account creation was successful')
        })
        res 
        .status(200)
        .send(`Account created. Your account number is ${accountNumber}`)
    } catch (error) {
        res.status(400).json(error)
    }
}

})
app.get("/balance/:accountNumber", async (req, res) => {
    try {
        const perBalance = await Balance.findOne({
            accountNumber: req.body.accountNumber
        })
        res.send(perBalance)
    }catch (error) {}
})


app.get("/balance", async (req, res) => {
    try{
        const results = await Balance.find({})
        res.status(200).json(results)
    }catch (error) {
        console.log(error)
    }
})

app.listen(PORT, () =>{
    console.log(`Server listening on port ${PORT}`)
})