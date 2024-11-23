export const errors = {
  error: { message: "Client Error", statusCode: 400 },
  auth: {
    unauthorized: { message: "Invalid Credentials", statusCode: 401 },
    expiredPassword: {
      message: "Temporary password expired.",
      statusCode: 401,
    },
  },
  forbidden: { message: "Permission Required", statusCode: 403 },
  notFound: { message: "Not Found", statusCode: 404 },
  fatal: { message: "Server Error", statusCode: 500 },
  noData: { message: "Data not found", statusCode: 204 },
  conflict: {
    badge: {
      message: "Badge or keyword currently under evaluation",
      statusCode: 409,
    },
    habit: {
      message: "User already has that habit added on that day.",
      statusCode: 409,
    },
    userEmail: {
      message: "Email address already in use.",
      statusCode: 409,
    },
    username: {
      message: "Username already in use",
      statusCode: 409,
    },
    user: {
      message: "User already logged in",
      statusCode: 409,
    },
  },
  unprocessableEntity: {
    message:
      "Names, email, or username too short / names include element different than text.",
    statusCode: 422,
  },
};
