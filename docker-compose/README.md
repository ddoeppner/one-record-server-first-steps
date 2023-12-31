# Start minimal ne-one server setup with ne-one view, ne-one play, and database
```bash
docker-compose up -d
```

# Overview of services

| Name | Description | Base URL / Admin UI |
|-|-|-|
| ne-one server | [ne-one server](https://git.openlogisticsfoundation.org/wg-digitalaircargo/ne-one) | http://localhost:8080 |
| ne-one view | [ne-one view](https://git.openlogisticsfoundation.org/wg-digitalaircargo/ne-one-view) | http://localhost:3000 |
| ne-one play | [ne-one play](https://github.com/aloccid-iata/neoneplay) | http://localhost:3001 |
| graphdb | GraphDB database as database backend for ne-one server | http://localhost:7200 |
| keycloak | Identity provider for ne-one server to authenticate ONE Record clients and to obtain tokens for outgoing requests. <br/> **Preconfigured client_id:** neone-client<br/> **Preconfigured client_secret:** lx7ThS5aYggdsMm42BP3wMrVqKm9WpNY  | http://localhost:8989 <br/> (username/password: admin/admin)|

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

> If you want to use SPARQL to connect to a database, you must change
> the configuration of the ne-one server.
> 
> Replace in docker-compose.yml the following lines:
> ```yaml
> - REPOSITORY_TYPE=http
> - HTTP_REPOSITORY_URL=http://graph-db:7200/repositories/neone
> ```
> with
> ```yaml
> - REPOSITORY_TYPE=sparql
> - SPARQL_QUERY_ENDPOINT=http://graphdb:7200/repositories/neone
> - SPARQL_UPDATE_ENDPOINT=http://graphdb:7200/repositories/neone/statements
> ```
