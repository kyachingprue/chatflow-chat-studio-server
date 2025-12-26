import yup from "yup"
export const userSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, "Username must be atleast of 3 character")
    .required(),
  email: yup
    .string()
    .email("The email is not valid one")
    .required(),
  password: yup
    .string()
    .min(6, "Password must be atleast 6 character")
    .required()
})

export const validateUser = schema => async (req, res, next) => {
  console.log('Request body:', req.body); // see what is sent
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    console.log('Validation errors:', error.errors); // see exactly which field failed
    return res.status(400).json({ errors: error.errors });
  }
};
