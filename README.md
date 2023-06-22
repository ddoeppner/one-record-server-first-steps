# First Steps with ONE Record Servers

## Introduction

Hello and welcome to this is a short tutorial.
The tutorial is intended to help ONE Record users get started with their ONE Record servers.
It covers the topics:

- Authentication with Access Tokens
- Connecting to a ONE Record Server
- Requesting Logistics Objects
- Creating Logistics Objects
- Updating Logistics Objects


### Important Terms and Concepts

| Name | Description | Example |
| ---- | ----------- | ------- |
| **token_endpoint** | HTTP endpoint provided by the authentication server that can be queried with client_id, client_secret, and scope to get an access_token | https://authn.one-record.de/6323c95e-a4bd-47c2-aba3-38a88716c619/b2c_1a_hackathon/oauth2/v2.0/token |
| **client_id** | A public identifier for app/daemon/client used to authenticate to an authentication server. | f108f391-b46b-43fe-9a73-831f4b1ba519 |
| **client secret** | Secret known only to the app/daemon/client and the authentication server. Comparable to a password. | FwY8Q~WkDKF6JaFjH3_6HeM6BrGAaefPkcWvkbQm |
| **scope** | Limits an application's access. Not necessary for ONE Record authentication, but required by some authentication servers. | https://authn.one-record.de/f108f391-b46b-43fe-9a73-831f4b1ba519/.default |
| **ONE Record Server URL** | Base URL of the ONE Record Server that can be used to get the ServerInformation | https://api-demo.one-record.de |
| **LogisticsObjectURI** | Globally unique identifier that is created when a new LogisticsObject is created | https://api-demo.one-record.de/logistics-objects/eff8ba45-6d2c-4f0b-8a33-9de8f830f38b |
| **Data Owner URI** | Data Owner of a ONE Record Server,  | https://api-demo.one-record.de/logistics-objects/51cbed0f-43db-4a8a-a0db-e80937540511 |

## Prerequisites

- [Postman](https://www.postman.com) desktop app installed or Postman web app
- Authentication server endpoint: token_endpoint
- Credentials that authenticates you as the data owner of a ONE Record Server: client_id, client_secret, scope
- Your ONE Record Server URL

# Preparation

## Setup a Workspace in Postman and import example requests

1) On the home screen of Postman, click Create Workspace
2) Select a name of the new Workspace, for example, ONE Record Tutorials
3) Visibility can be left with Team
4) Click Create Workspace
5) Click Import
6) Drag'n'Drop the Postman collection or select file.
(The Postman collection can be found [here](assets/ONE%20Record%20Hackathon%20Servers-%20First%20Steps.postman_collection.json).)
7) Expand the newly imported collection to see all example requests by click on the caret icon

![Preparation of Postman - Part 1](assets/Postman_Preparation-1.png)
![Preparation of Postman - Part 2](assets/Postman_Preparation-2.png)
![Preparation of Postman - Part 3](assets/Postman_Preparation-3.png)
![Preparation of Postman - Part 4](assets/Postman_Preparation-4.png)

# Obtain an Access Token

1) Select “Obtain an access token” request
2) Replace <token_endpoint> with your provided token_endpoint
3) Select Response Body tab and replace <client_id> with your provided client_id
4) Replace <client_id> with your provided client_id
5) Replace  <client_secret> with your provided client_secret
6) Press Send-Button to request access token
7) Copy access_token value without Quotation marks “ ”

![Obtain an access token](assets/Obtain-an-access-token.png)

# Get ServerInformation

1) Select "Get ServerInformation" request
2) Replace <one_record_server_url> with your provided ONE Record Server URL
3) Select Authorization tab and replace <access_token> with previously copied access_token
4) Press Send-Button to request ServerInformation
5) Compare `@id` of dataOwner in the response with your provided Data Owner URI

![Get ServerInformation](assets/Get-ServerInformation.png)

# Get Data Owner Logistics Object

1) Select "Get data owner (LogisticsObject)" request
2) Replace <data_owner_uri> with your provided Data Owner URI or the copied `@id` from previous response
3) Select Authorization tab and replace <access_token> with previous copied access_token
4) Press Send-Button to request data owner data
5) Select Headers Tab in Response to check the latest-revision number. If the data owner has not been changed yet, this value should be "1".

![Get Data Owner](assets/Get-data-owner.png)

# Create Person (LogisticsObject)

1) Select "Create Person (LogisticsObject)" request
2) Replace <one_record_server_url> with your provided ONE Record Server URL, the endpoint must contain ´/logistics-objects`
3) Select Authorization tab and replace <access_token> with previously copied access_token
4) Select Request Body Tab and modify the information about the Person you want to create
5) Press Send-Button to create the new Person
6) Select Headers Tab in Response to check the location header. This is the LogisticsObjectURI of the newly created Person. Copy it for the next request.

![Create Person - Part 1](assets/Create-Person-1.png)
![Create Person - Part 2](assets/Create-Person-2.png)

# Update DataOwner Organization (add Person and replace name)

1) Select "Update DataOwner Organization (add Person and replace name)" request
2) Replace <data_owner_uri> with your provided Data Owner URI or the copied `@id` from previous response
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
![Update Data Owner - Part 2](assets/Update-Data-Owner-2.png)
![Update Data Owner - Part 3](assets/Update-Data-Owner-3.png)


# Supporting documents and further readings

- [Postman collection](assets/ONE%20Record%20Hackathon%20Servers-%20First%20Steps.postman_collection.json)
- [ONE Record API specification](https://iata-cargo.github.io/ONE-Record/)
- [ONE Record data model](https://github.com/IATA-Cargo/ONE-Record/tree/master/working_draft/ontology)
