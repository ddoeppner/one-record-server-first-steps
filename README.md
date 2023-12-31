# First Steps with NE:ONE Server

> [NE:ONE - opeN sourcE: ONE record server software](https://git.openlogisticsfoundation.org/wg-digitalaircargo/ne-one)

## Introduction

Hello and welcome to this short tutorial.
The tutorial is intended to help ONE Record users get started with their ONE Record servers.
The examples are based on a local development environment, e.g. the ONE Record Server is available at http://localhost:8080.
However, all steps can be performed on any other ONE Record Server, regardless of the environment, e.g. cloud environment deployments such as Amazon AWS or Microsoft Azure.

This tutorials covers the following topics:

- Setup a local development environment
- Setup a cloud environment with Amazon AWS
- Authentication with Access Tokens
- Connecting to a ONE Record Server
- Requesting Logistics Objects
- Creating Logistics Objects
- Updating Logistics Objects

The tutorial is based on the ONE Record API specification v2.0.0, ONE Record data model v3.0.0, and the NE:ONE Server v1.1.0.

### Important Terms and Concepts

| Name | Description | Example |
| ---- | ----------- | ------- |
| **ONE Record server URL** | Base URL of the ONE Record Server that can be used to get the ServerInformation | <ul><li>http:/localhost:8080</li><li>https://1r.example.com</li></ul> |
| **LogisticsObjectURI** | Globally unique identifier that is created when a new LogisticsObject is created | http://localhost:8080/logistics-objects/eff8ba45-6d2c-4f0b-8a33-9de8f830f38b |
| **Data holder URI** | Data holder of a ONE Record Server and the LogisticsObject located on it. Technically, this is a data object of type [Organization](https://onerecord.iata.org/ns/cargo#Organization), which is a subclass of LogisticsObject | <ul><li>http://localhost:8080/logistics-objects/_data-holder</li><li>https://1r.example.com/logistics-objects/51cbed0f-43db-4a8a-a0db-e80937540511</li></ul> |
| **Access token URL** | HTTP endpoint provided by the authentication server that can be queried with client_id and client_secret to get an ID token | <ul><li>http://localhost:8989/realms/neone/protocol/openid-connect/token (Keycloak)</li><li>https://<tenant-name>.b2clogin.com/<tenant-name>.onmicrosoft.com/<policy-name>/oauth2/v2.0/token (Azure AD B2C)</li><li>https://<domain>.auth.<region>.amazoncognito.com/oauth2/token (AWS Cognito)</li><li>https://<domain>.okta.com/oauth2/<authorizationServerId>/v1/token (Okta)</li></ul> |
| **client_id** | A public identifier for app/daemon/client used to authenticate to an authentication server. | <ul><li>neone-client (Keycloak)</li><li>f108f391-b46b-43fe-9a73-831f4b1ba519</li></ul> |
| **client secret** | Secret known only to the app/daemon/client and the authentication server. Comparable to a password. | <ul><li>lx7ThS5aYggdsMm42BP3wMrVqKm9WpNY (Keycloak)</li><li>FwY8Q~WkDKF6JaFjH3_6HeM6BrGAaefPkcWvkbQm</li></ul> |
| **scope** | Limits an application's access. Not necessary for ONE Record authentication, but required by some authentication servers. | https://<tenant-name>.onmicrosoft.com/<api-app-id-uri>/access_as_application |
| **access token** | An access token / ID token is a JSON Web Token (JWT) that contains authenticated user information, issued by an authorization server as part of the authentication response. This needs to be sent with every ONE Record request to authenticate the client | eyJhbGciOiJSUzI1...zKUHw |

## Start your local ONE Record development environment

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- [Git](https://git-scm.com/downloads) installed

### Step by step guide

1) Clone the repository
   ```bash
   git clone https://github.com/ddoeppner/one-record-server-first-steps
   ```
2) Switch to the directory to docker-compose
   ```bash
   cd one-record-server-first-steps/docker-compose
   ```
3) Start all services with [docker compose](https://docs.docker.com/compose/)
   ```bash
   docker compose up -d
   ```
4) Wait until all containers are up and running:
   ```bash
   [+] Running 6/6
    ✔ Network docker-compose_default            Created 0.0s 
    ✔ Container docker-compose-graph-db-1       Healthy 0.0s 
    ✔ Container docker-compose-keycloak-1       Healthy 0.0s 
    ✔ Container docker-compose-ne-one-server-1  Started 0.0s 
    ✔ Container docker-compose-graph-db-setup-1 Started 0.0s
   ```
5) Try to access the ONE Record Server by  http://localhost:8080 using your favorite browser. 
   You should see a HTTP Error 401, because you did not authenticate yet. But this confirms that the ONE Record Server is up and running.

## Exchange data with your ONE Record server

### Prerequisites

- [Postman](https://www.postman.com) desktop app installed or Postman web app. However, When running the ONE Record server locally, you need to use the Postman Desktop Agent. [See here for more information on this topic.](https://learning.postman.com/docs/getting-started/basics/about-postman-agent/#the-postman-desktop-agent)
- when testing with a local ONE Record Server, the Postman desktop app is recommended.
- Your ONE Record Server URL
- Access Token URL configured in your ONE Record Server
- Credentials that authenticates you as the data owner of a ONE Record Server: client_id, client_secret, and scope (optional)

#### Setup a Workspace in Postman and import example requests

1) On the home screen of Postman, click Create Workspace
2) Select a name of the new Workspace, for example, ONE Record Tutorials
3) Visibility can be left with Team
4) Click Create Workspace
5) Click Import
6) Drag'n'Drop the Postman collection or select file.
(The Postman collection can be found [here](assets/ONE-Record_-_First_steps.postman_collection.json).)
7) Expand the newly imported collection "ONE Record - First Steps" to see all example requests by click on the caret icon

![Preparation of Postman - Part 1](assets/Postman_Preparation-1.png)
![Preparation of Postman - Part 2](assets/Postman_Preparation-2.png)
![Preparation of Postman - Part 3](assets/Postman_Preparation-3.png)
![Preparation of Postman - Part 4](assets/Postman_Preparation-4.png)

### Obtain an Access Token

1) Select “1) Obtain an access token” request
2) Replace <token_endpoint> with your provided token_endpoint
3) Select Response Body tab and replace <client_id> with your provided client_id
4) Replace <client_id> with your provided client_id
5) Replace  <client_secret> with your provided client_secret
6) Press Send-Button to request access token
7) You should see a response with an access_token.

![Obtain an access token](assets/Obtain-an-access-token.png)

### Get ServerInformation

1) Select "2) Get ServerInformation" request
2) Replace <one_record_server_url> with your ONE Record Server URL
3) Select Authorization tab and replace <access_token> with previously copied access_token
4) Press Send-Button to request ServerInformation
5) You should see a LogisticsObject of Type `Organization` as a response. This is the configured data holder of the ONE Record server.

![Get ServerInformation](assets/Get-ServerInformation.png)

### Get Data Owner Logistics Object

1) Select "3) Get data owner (LogisticsObject)" request
2) Replace <data_owner_uri> with your provided Data Owner URI or the copied `@id` from previous response
3) Select Authorization tab and replace <access_token> with previous copied access_token
4) Press Send-Button to request data owner data
5) Select Headers Tab in Response to check the latest-revision number. If the data owner has not been changed yet, this value should be "1".

![Get Data Owner](assets/Get-data-owner.png)

### Create Person (LogisticsObject)

1) Select "4) Create Person (LogisticsObject)" request
2) Replace <one_record_server_url> with your provided ONE Record Server URL, the endpoint must contain ´/logistics-objects`
3) Select Authorization tab and replace <access_token> with previously copied access_token
4) Select Request Body Tab and modify the information about the Person you want to create
5) Press Send-Button to create the new Person
6) Select Headers Tab in Response to check the location header. This is the LogisticsObjectURI of the newly created Person. Copy it for the next request.

![Create Person - Part 1](assets/Create-Person-1.png)
![Create Person - Part 2](assets/Create-Person-2.png)

### Update DataOwner Organization (add Person and replace name)

1) Select "5) Update DataOwner Organization (add Person and replace name)" request
2) Replace <data_owner_uri> with your Data Owner URI or the copied `@id` from previous response, default: http://localhost:8080/logistics-objects/_data-holder
3) Select Authorization tab and replace <access_token> with previous copied access_token
4) Select Request Body Tab
5) Setup the new name of the Data Owner Organization
6) Replace <data_owner_uri> with your provided Data Owner URI or the copied `@id` from previous response (4 times!)
7) Replace <person_LogisticsObjectURI> with your LogisticsObjectURI of the new created Person from last request
8) Make sure that the revision is the same as latest-revision, i.e. 1
9) Press Send-Button to update the data owner organization
10) Select "Get data owner (LogisticsObject)" request again
11) Press Send-Button to request data owner data
12) Verify that the data owner object changed and the latest-revision is "2"

![Update Data Owner - Part 1](assets/Update-Data-Owner-1.png)
![Update Data Owner - Part 2](assets/Update-Data-Owner-2b.png)
![Update Data Owner - Part 3](assets/Update-Data-Owner-3b.png)

## Supporting documents and further readings

- [Postman collection](assets/ONE-Record_-_First_steps.postman_collection.json)
- [ONE Record API specification](https://iata-cargo.github.io/ONE-Record/)
- [ONE Record data model](https://github.com/IATA-Cargo/ONE-Record/tree/master/working_draft/ontology)
- [NE:ONE - opeN sourcE: ONE record server software](https://git.openlogisticsfoundation.org/wg-digitalaircargo/ne-one)
