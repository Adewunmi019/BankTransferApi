const Joi = require("joi");

const openAccount = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    Balance: Joi.number().required(),
  });
  return schema.validate(data);
};
module.exports.openAccount = openAccount;
