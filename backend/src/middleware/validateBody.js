const validateBody = (schema) => {
  return (req, res, next) => {
    const validationResult = schema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      //error messages for each failed validation
      const errorMessages = validationResult.error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }));

      //send back a json response with an array of detailed error messages
      return res.status(400).json({ errors: errorMessages });
    } else {
      //if validation succeeds
      req.body = validationResult.value;
      next();
    }
  };
};

export { validateBody };
