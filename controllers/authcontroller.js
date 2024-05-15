const authController = (passport) => {
    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
      },
      (accessToken, refreshToken, profile, done) => {
        console.log(profile)
      }
    ));
  
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback"
      },
      (accessToken, refreshToken, profile, done) => {
        // Use profile information (e.g., profile.id) to create or find a user in your database
        // Call done(null, user) when finished
      }
    ));
  };
  
  export default authController;
  