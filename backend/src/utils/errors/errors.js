export const errors = {
  error: {
    friendRequestSameUser: {
      message: "Friend request has to be sent to a different user",
      statusCode: 400,
    },
    messageTooLong: { message: "Message is too long", statusCode: 400 },
    notFriends: {
      message: {
        message:
          "Messages can only be sent if users are friends with each other.",
        statusCode: 400,
      },
      chat: {
        message: "Two users that are not friends can't have a chat",
        statusCode: 400,
      },
    },
    characterNotAllowed: {
      message: "Username can't include @ sign.",
      statusCode: 400,
    },
  },
  auth: {
    unauthorized: { message: "Invalid Credentials", statusCode: 401 },
    expiredPassword: {
      message: "Temporary password expired.",
      statusCode: 401,
    },
  },
  forbidden: { message: "Permission Required", statusCode: 403 },
  notFound: {
    userNotFound: { message: "User not Found", statusCode: 404 },
    habitNotFound: {
      message: `Habit not found, or not added on that day.`,
      statusCode: 404,
    },
    messageNotFound: { message: "Message not found", statusCode: 404 },
  },
  fatal: { message: "Server Error", statusCode: 500 },
  noData: { message: "Data not found", statusCode: 204 },
  conflict: {
    currentBadge: {
      message: "Badge or keyword already exists.",
      statusCode: 409,
    },
    pendingBadge: {
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
