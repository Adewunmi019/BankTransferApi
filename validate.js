const Joi = require("joi");

const Transaction = (data) => {
  const schema = Joi.object({
    senderAccount: Joi.number().required(),
    receiverAccount: Joi.number().required(),
    amount: Joi.number().required(),
    Narration: Joi.string(),
  });
  return schema.validate(data);
};
const openAccount = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    Balance: Joi.number().required(),
  });
  return schema.validate(data);
};


module.exports.Transaction = Transaction;
module.exports.openAccount = openAccount;
