/**
 * name : UserExtension.js
 * author : PraveenDass
 * created-date : 26-Nov-2024
 * Description :  UserExtension Controller.
 */

module.exports = class UserExtension extends Abstract {
	constructor() {
		super('user-extension')
	}

	static get name() {
		return 'userExtension'
	}
}
