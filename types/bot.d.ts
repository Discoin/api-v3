import {Currency} from 'src/currencies/currency.entity';

/**
 * A signed-in bot from the bearer token authentication system which uses Passport.
 *
 * Accessible through `req.user`.
 */
export interface SignedInBot {
	/** The Discord ID for this signed-in bot. */
	id: string;
	/** The API token for this signed-in bot. */
	token: string;
	/** The currency that this signed-in bot uses. */
	currency: Currency;
}
