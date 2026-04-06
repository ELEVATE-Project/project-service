window['env'] = {
	production: true,
	baseURL: 'https://qa.elevate-apis.shikshalokam.org',
	capabilities: 'all',
	restrictedPages: ['DOWNLOADS', 'AUTH_PAGES', 'PROFILE', 'EDIT_PROFILE'],
	unauthorizedRedirectUrl: '/',
	isAuthBypassed: true,
	profileRedirectPath: '<PathToProfileEdit>',
	showHeader: true,
	config: {
		logoPath: 'assets/images/logo.png',
		faviconPath: 'assets/icons/elevate-logo.png',
		title: 'Elevate',
		redirectUrl: '/home',
	},
	hostPath: '/ml/',
}
