describe('The patrol-route Main Form', () => {
    it('loads successfully', () => {
        cy.visit('http://localhost:3000')

        cy.get('.App').should('be.visible')
            .within(() => {
                cy.get('div')
                    
            })
            
    })
})