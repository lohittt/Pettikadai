const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { findByEmail, findById, verifyPassword } = require('../services/authService');

/**
 * Configure Passport local strategy and serialization.
 */
function configurePassport() {
    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const user = await findByEmail(email.toLowerCase().trim());
                if (!user) {
                    return done(null, false, { message: 'Invalid email or password' });
                }
                const match = await verifyPassword(password, user.password_hash);
                if (!match) {
                    return done(null, false, { message: 'Invalid email or password' });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await findById(id);
            done(null, user || false);
        } catch (err) {
            done(err);
        }
    });

    return passport;
}

module.exports = { configurePassport };
