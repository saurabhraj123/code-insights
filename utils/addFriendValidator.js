import Joi from "joi";

const addFriendSchema = Joi.object({
  name: Joi.string().required(),

  leetcode: Joi.string()
    .regex(/^https:\/\/leetcode\.com\/[a-zA-Z0-9_-]+\/?$/)
    .required()
    .messages({
      "string.required": "Leetcode username is required.",
      "string.pattern.base": "Leetcode profile is not valid.",
    }),
});

export default addFriendSchema;
