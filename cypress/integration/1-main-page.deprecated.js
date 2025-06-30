/// <reference types="cypress" />

describe('Main Page', () => {
	beforeEach(() => {
		cy.login('preview', 'password');
	});

	it('should load chat lists', () => {
		cy.get('.sidebar__results__chats')
			.children()
			.its('length')
			.should('be.gte', 1);
	});

	it('should load messages of a single chat', () => {
		cy.get('.sidebar__results__chats').children().first().click();
		cy.wait(2000);
		cy.get('#chat__body')
			.children('.chat__message__outer')
			.its('length')
			.should('be.gte', 1);
	});

	it('should load persons/contacts', () => {
		cy.get('[data-test-id="new-chat"]').click();
		cy.wait(2000);
		cy.get('[data-test-id="contacts-list"')
			.children()
			.its('length')
			.should('be.gte', 1);
	});

	it('should send message', () => {
		const MESSAGE = 'This is a test message from Cypress';

		cy.get('.sidebar__results__chats').children().first().click();
		cy.wait(2000);
		cy.get('#typeBox__editable').focus().type(MESSAGE);
		cy.get('[data-test-id="send-message-button"]').click();
		cy.wait(2000);
		cy.get('#chat__body')
			.children('.chat__message__outer')
			.last()
			.find('.wordBreakWord')
			.should('have.text', MESSAGE);
	});

	it('should send template message', () => {
		cy.get('.sidebar__results__chats').children().first().click();
		cy.wait(2000);
		cy.get('[data-test-id="templates-button"]').click();
		cy.get('[data-test-id="template-messages"]')
			.children('.templateMessageWrapper')
			.first()
			.find('button')
			.click();
		cy.get('[data-test-id="send-template-message-button"]').click();
		cy.wait(2000);
		cy.get('#chat__body')
			.children('.chat__message__outer')
			.last()
			.find('.messageType__template')
			.should('be.visible');
	});

	it('should start new chat message', () => {
		cy.get('[data-test-id="new-chat"]').click();
		cy.wait(2000);
		cy.get('[data-test-id="start-new-chat"]').click();
		cy.get('[data-test-id="start-chat-by-phone"]').should('have.text', 'Start');
	});

	it('should logout', () => {
		cy.get('[data-test-id="options"]').click();
		cy.get('[data-test-id="logout-button"]').click();
		cy.wait(2000);
		cy.get('.login__body > p:nth-child(3)').should(
			'have.text',
			'Please login to start'
		);
	});
});
