# ONE Record Hackathon

Welcome to the ONE Record Hackathon, in this document you will find all the instructions to run a NE:ONE Server and a NE:ONE Play instance on AWS

## Join the AWS event

To use the AWS services you will need to join the AWS Event.

1. Connect to the followint link : https://catalog.us-east-1.prod.workshops.aws/join?access-code=840a-052279-10

2. Request a ONE Time Password with the email you used to register for the hackathon

![Image1](./assets/image/Image1.PNG)

3. Scroll at the and of the page, Accept the terms and conditions and click on "Join event"

![Image2](./assets/image/Image2.PNG)

## AWS NE:ONE Setup

In order to create a NE:ONE server on AWS, please follow the next steps:

1. After join the event you will be redirect to the page of the event

2. On the left menu click on "Open AWS console"

![Image3](./assets/image/image3.PNG)

3. Now you have access the AWS console, from here you can check all AWS tools.

4. Search Cloud 9 in the search bar at the top, and click on it

![Image4](./assets/image/image4.PNG)

5. In the Cloud 9 page, click "Open" under "Cloud9 IDE" 

![Image5](./assets/image/image5.PNG)

6. Once Cloud 9 is started, use the terminal at the bottom to run the following commands:

``` 
git clone -b feature/aws https://github.com/ddoeppner/one-record-server-first-steps.git
cd one-record-server-first-steps/deployment
chmod +x deploy.sh
./deploy.sh
```

![Image7](./assets/image/image7.PNG)

7. Wait around 20/30 minutes until the deployment finished

8. Once the deployment is finished (the terminal becomes available), go back to the AWS console. Search for APP Runner and click on it. 

![Image11](./assets/image/image11.PNG)

9. In APP Runner you will find two running containers
    - neoneserverapp_dev : In the default domain you will find the address of the NE:ONE Server
    - neoneauthapp_dev : In the default domain you will find the address of the Key cloak Server
![Image12](./assets/image/image12.PNG)

10. When using the default domain please add always :443 at the end.
    
## AWS NE:ONE Play Setup

In order to create a NE:ONE Play instance on AWS, please follow the next steps:

1. Follow the NE:ONE server guide until Cloud 9 is started (step 5)

2. Once Cloud 9 is started, use the terminal at the bottom to run the following commands:

``` 
git clone -b feature/aws https://github.com/aloccid-iata/neoneplay
cd one-record-server-first-steps/deployment
chmod +x deploy.sh
./deploy.sh
```

3. Wait around 20/30 minutes until the deployment finished

4. Once the deployment is finished, go back to the AWS console. Search for APP Runner and click on it.

![Image11](./assets/image/image11.PNG)

5. In APP Runner you will find a running container:

    - neoneplayapp_dev : In the default domain you will find the address of the NE:ONE Play instance

![Image12](./assets/image/image12.PNG)

## Postman Collection

To have you up and running we prepared a Postman collection. You will need to install Postman or a compatible software in order to use it.

- [Download the Postman Collection here.](./assets/postman/Hackathon.postman_collection.json) It will open a new github page, use the download button to get the file
- [Download the Postman Environment here](./assets/postman/Hackathon.postman_environment.json). It will open a new github page, use the download button to get the file
- Import the Environment in Postman
![Image9](./assets/image/image9.PNG)
- Import the Collection in Postman
![Image8](./assets/image/image8.PNG)
- In the Environments tab, select Hackathon environment and set the baseUrlKeyCloak to the default domain of the neoneauthapp_dev of the APP Runner.
![Image10](./assets/image/image10.PNG)
- Set the baseUrlShipper,baseUrlForwarder and baseUrlAirline to the to the default domain of the neoneserverapp_dev of the APP Runner. **Please add ':443' ad the end of the host** (i.e. host:443) and remove the **/** at the end.
![Image14](./assets/image/image14.PNG)
- Select Collections on the right menu and open the Hackathon collection already imported
- Use the Token Request call to generate and access token
![Image16](./assets/image/image16.PNG)
- Copy the access token (it might be a long string, please copy the full content) in the Authorization tab of the Get ServerInformation and run the call
![Image15](./assets/image/image15.PNG)
- If everything is setup correctly, you will see the server information of the AWS server
- Copy the access token in Authentication tab of the Example Workflow folder
- Run the calls one by one to create the objects. The order is important as each call is connected to the previous one.

## Issues

If one of the container shows the Hello world container, please run the ./deploy.sh again. Something went wrong in the deployment of the actual resources
![Image13](./assets/image/image13.PNG)


