import cy from "cypress";

it("should load the login page", () => {
    cy.visit("/");
    cy.findAllByText(/Welcome/i).should("have.length", 1);
});
