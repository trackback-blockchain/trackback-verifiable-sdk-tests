const { CredentialIssuer, Connector, TrackBackAgent, CredentialVerifier } = require('@trackback/agent');
const { expect } = require('chai');

describe('TrackBack Agent SDK Tests', () => {

    it('should save a did document', async () => {
        const connector = new Connector()
        const agent = new TrackBackAgent(connector);

        const account = await connector.getDefaultAccount()

        const context = {
            agent,
            account: account
        }
        const issuer = await CredentialIssuer.build();

        const result = await issuer.save(context, { "hello": "docMeta" }, { "hello": "resolutionMeta" });
        expect(result).to.deep.equal(issuer.toDidDocument());
    });

    it('should save and resolve a did document', async () => {
        const connector = new Connector()
        const agent = new TrackBackAgent(connector);

        const account = await connector.getDefaultAccount()

        const context = {
            agent,
            account: account
        }
        const issuer = await CredentialIssuer.build();

        const metada = { "hello": "docMeta" }
        const resMetada = { "hello": "resolutionMeta" }

        const result = await issuer.save(context, metada, resMetada);

        expect(result).to.deep.equal(issuer.toDidDocument());

        let r = await agent.procedure.resolve(issuer.toDidDocument().id);

        expect(r).to.have.property('did_resolution_metadata');
        expect(r).to.have.property('did_document_metadata');
        expect(r).to.have.property('did_document');

        expect(r.did_document_metadata).to.deep.equal(metada);
        expect(r.did_resolution_metadata).to.deep.equal(resMetada);
        expect(r.did_document).to.deep.equal(issuer.toDidDocument());

    })


    it('should Create a verifiable credential ', async () => {


        const connector = new Connector()
        const agent = new TrackBackAgent(connector);

        const account = await connector.getDefaultAccount()

        const context = {
            agent,
            account: account
        }

        const issuer = await CredentialIssuer.build();

        const metada = { "content-type": "application/json" }
        const resMetada = { "content-type": "application/json" }

        const result = await issuer.save(context, metada, resMetada);

        expect(result).to.deep.equal(issuer.toDidDocument());


        const credential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuanceDate: '2010-01-01T19:23:24Z',
            credentialSubject: { name: "Test", surname: "Test Test" },
            issuer: issuer.id,
        };
        const jwt = await issuer.createVerifiableCredentials(credential);

        expect(typeof jwt).to.be.equal('string')
        expect(jwt.split('.').length).to.be.equal(3)

    })


    it('should Create a verifiable presentation ', async () => {


        const connector = new Connector()
        const agent = new TrackBackAgent(connector);

        const account = await connector.getDefaultAccount()

        const context = {
            agent,
            account: account
        }

        const issuer = await CredentialIssuer.build();

        const metada = { "content-type": "application/json" }
        const resMetada = { "content-type": "application/json" }

        const result = await issuer.save(context, metada, resMetada);

        expect(result).to.deep.equal(issuer.toDidDocument());


        const credential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuanceDate: '2010-01-01T19:23:24Z',
            credentialSubject: { name: "Test", surname: "Test Test" },
            issuer: issuer.id,
        };
        const jwt = await issuer.createVerifiableCredentials(credential);

        expect(typeof jwt).to.be.equal('string')
        expect(jwt.split('.').length).to.be.equal(3)

        // Issuer creates a verifiable credential presentation 
        const jwtPresentation = await issuer.createVerifiablePresentation([jwt], issuer.keypair);
        expect(typeof jwtPresentation).to.be.equal('string');

        expect(jwtPresentation.split('.').length).to.be.equal(3);

    })


    it('should validate a verifiable presentation ', async () => {


        const connector = new Connector()
        const agent = new TrackBackAgent(connector);

        const account = await connector.getDefaultAccount()

        const context = {
            agent,
            account: account
        }

        const issuer = await CredentialIssuer.build();

        const metada = { "content-type": "application/json" }
        const resMetada = { "content-type": "application/json" }

        const result = await issuer.save(context, metada, resMetada);

        expect(result).to.deep.equal(issuer.toDidDocument());


        const credential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuanceDate: '2010-01-01T19:23:24Z',
            credentialSubject: { name: "Test", surname: "Test Test" },
            issuer: issuer.id,
        };
        const jwt = await issuer.createVerifiableCredentials(credential);

        expect(typeof jwt).to.be.equal('string')
        expect(jwt.split('.').length).to.be.equal(3)

        // Issuer creates a verifiable credential presentation 
        const jwtPresentation = await issuer.createVerifiablePresentation([jwt], issuer.keypair);
        expect(typeof jwtPresentation).to.be.equal('string');

        expect(jwtPresentation.split('.').length).to.be.equal(3);



        const accountB = await connector.getDefaultAccount("Bob")
        const contextB = {
            agent,
            account: accountB
        }
        const verifier = new CredentialVerifier();
        const r = await verifier.verifyPresentation(jwtPresentation, contextB)
        expect(r).to.be.equal(true);

    })



})
