module.exports = async function (context, req) {
  const { userId } = req.body;

  // Input validation
  if (!userId) {
      context.res = {
          status: 400,
          body: "User ID is required."
      };
      return;
  }

  // Prepare the object to be written to the database
  const outputRecord = {
      UserId: userId,
      RecommendationsReady: true
  };

  // Assign the output to the SQL binding
  context.bindings.outputSql = outputRecord;

  context.res = {
      status: 200,
      body: `User ${userId}'s recommendations status updated to true`
  };
};
