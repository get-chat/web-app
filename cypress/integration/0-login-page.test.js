/* eslint-disable no-undef */

describe('Login Page', () => {
	it('should load the login page', () => {
		cy.visit('/');
		cy.get('.login__body > h2:nth-child(2)').should('have.text', 'Welcome');
		cy.get('.login__body > p:nth-child(3)').should(
			'have.text',
			'Please login to start'
		);
	});

	it('was able to log in', () => {
		cy.login('preview', 'password');
		cy.get('.chat__default > h2').should('have.text', 'Hey');
	});
});
