# Start minimal ne-one server setup with database
```bash
docker-compose up -d
```

# Overview of services

| Name | Description | Base URL / Admin UI |
|-|-|-|
| ne-one server | [ne-one server](https://git.openlogisticsfoundation.org/wg-digitalaircargo/ne-one) | http://localhost:8080 |
| graphdb | GraphDB database as database backend for ne-one server | http://localhost:7200 |
| keycloak | Identity Provider for ne-one server to authenticate ONE Record clients and to obtain tokens for outgoing requests | http://localhost:8089 |

# Alternative supporting services

## Identity Provider (replacement of Keycloak)

- [Amazon Cognito](https://aws.amazon.com/de/cognito/)
- [Auth0 by Okta](https://auth0.com/de/features/machine-to-machine)
- [Azure Active Directory B2C](https://learn.microsoft.com/en-us/azure/active-directory-b2c/overview)

_(this list is not exclusive)_

## Database backend (repacement of Ontotext GraphDB)

- [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/)
- [AWS Neptune](https://aws.amazon.com/de/neptune/)
- [OpenLink Software: Virtuoso](https://virtuoso.openlinksw.com/)
- [RDF4J Servce](https://rdf4j.org/documentation/tools/server-workbench/)
- [Stardog](https://www.stardog.com/)

_(this list is not exclusive)_
