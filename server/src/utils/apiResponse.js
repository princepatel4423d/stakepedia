export const successResponse = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const errorResponse = (res, message, statusCode = 400, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

export const paginatedResponse = (res, message, data, pagination) =>
  res.status(200).json({ success: true, message, data, pagination });