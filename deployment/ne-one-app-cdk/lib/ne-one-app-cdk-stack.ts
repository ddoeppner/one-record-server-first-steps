import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NeOneServices } from './ne-one-services';

export interface NeOneAppStackProps extends cdk.StackProps {
    envName: string
}


export class NeOneAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NeOneAppStackProps) {
    super(scope, id, props);

    const appContainerRepositoryName = new cdk.CfnParameter(this, "appContainerRepositoryName", {
        type: "String",
        description: "The Name of the Container repository for application."
    });

    const authContainerRepositoryName = new cdk.CfnParameter(this, "authContainerRepositoryName", {
        type: "String",
        description: "The Name of the Container repository for application."
    });

    const dbReadEndpoint = new cdk.CfnParameter(this, "dbReadEndpoint", {
        type: "String",
        description: "The database read endpoint."
    });

    const clientSecret = new cdk.CfnParameter(this, "clientSecret", {
        type: "String",
        description: "The keycloak client secret."
    });

    const dbWriteEndpoint = new cdk.CfnParameter(this, "dbWriteEndpoint", {
        type: "String",
        description: "The database write endpoint."
    });
    const serverHost = new cdk.CfnParameter(this, "serverHost", {
        type: "String",
        description: "The neOne server host.",
        default: "localhost"
    });
    const serverPort = new cdk.CfnParameter(this, "serverPort", {
        type: "String",
        description: "The neOne server port",
        default: "8080"
    });
    const serverProtocol = new cdk.CfnParameter(this, "serverProtocol", {
        type: "String",
        description: "The neOne server protocol.",
        default: "http"
    });

    const app = new NeOneServices(this, "services-" + props?.envName, {
        envName: props.envName, 
        appContainerRepositoryName: appContainerRepositoryName.valueAsString, 
        authContainerRepositoryName: authContainerRepositoryName.valueAsString,
        dbReadEndpoint: dbReadEndpoint.valueAsString,
        dbWriteEndpoint: dbWriteEndpoint.valueAsString,
        clientSecret: clientSecret.valueAsString,
        serverHost: serverHost.valueAsString,
        serverPort: serverPort.valueAsString,
        serverProtocol: serverProtocol.valueAsString,
        });
    }
}
