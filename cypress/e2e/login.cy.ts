describe('Login', () => {
	it('should login', () => {
		// Login
		cy.visit('http://localhost:3000/login')
		cy.get('[data-testid="username"]').type('testuser')
		cy.get('[data-testid="password"]').type('password')
		cy.get('[data-testid="submit"]').click()

		// Verify login success
		cy.url().should('include', '/main')
		cy.contains('Hey').should('exist')
	})
})

export {};
