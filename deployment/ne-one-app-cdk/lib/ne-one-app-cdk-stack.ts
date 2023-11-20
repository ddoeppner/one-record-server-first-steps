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

    const oidcEndpoint = new cdk.CfnParameter(this, "oidcEndpoint", {
        type: "String",
        description: "The oidc endpoint."
    });

    const oidcClientId = new cdk.CfnParameter(this, "oidcClientId", {
        type: "String",
        description: "The oidc client id."
    });

    const oidcClientSecret = new cdk.CfnParameter(this, "oidcClientSecret", {
        type: "String",
        description: "The oidc client secret"
    });

    const dbReadEndpoint = new cdk.CfnParameter(this, "dbReadEndpoint", {
        type: "String",
        description: "The database read endpoint."
    });

    const dbWriteEndpoint = new cdk.CfnParameter(this, "dbWriteEndpoint", {
        type: "String",
        description: "The database write endpoint."
    });

    const app = new NeOneServices(this, "services-" + props?.envName, {
        envName: props.envName, 
        appContainerRepositoryName: appContainerRepositoryName.valueAsString, 
        oidcEndpoint: oidcEndpoint.valueAsString,
        oidcClientId: oidcClientId.valueAsString,
        oidcClientSecret: oidcClientSecret.valueAsString,
        dbReadEndpoint: dbReadEndpoint.valueAsString,
        dbWriteEndpoint: dbWriteEndpoint.valueAsString
      });
  }
}
