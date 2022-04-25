/* eslint-disable no-undef */
import "@testing-library/cypress/add-commands";

Cypress.Commands.add("login", (username, password) => {
    cy.visit("/");
    cy.get('[data-test-id="username"] input').focus().type(username);
    cy.get('[data-test-id="password"] input').focus().type(password);
    cy.get('[data-test-id="submit"]').click();
    cy.wait(10000);
    cy.url().should("contain", "/main");
});
