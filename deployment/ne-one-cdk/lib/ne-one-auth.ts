import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CfnOutput, Stack } from 'aws-cdk-lib';

export interface NeOneAuthProps extends cdk.StackProps {
    envName: string
}

export class NeOneAuth extends Construct {

    public readonly userPool: cognito.UserPool;
    public readonly scope: string;

    constructor(scope: Construct, id: string, props: NeOneAuthProps) {
        super(scope, id);

        const envName = props.envName;
        this.userPool = new cognito.UserPool(this, 'ne-oneuserpool-' + envName, {
            userPoolName: 'ne-one-userpool-' + envName,
            signInAliases: {
                username: true,
                email: true,
            },
            passwordPolicy: {
                minLength: 8,
                requireDigits: false,
                requireLowercase: false,
                requireSymbols: false,
                requireUppercase: false,
            },
            selfSignUpEnabled: true,
            userInvitation: {
                emailSubject: 'Invite to join our awesome ne-one app!',
                emailBody: 'Hello {username}, you have been invited to join our awesome neOne app! Your temporary password is {####}',
                smsMessage: 'Hello {username}, your temporary password for our awesome neOne app is {####}',
            },
        });

        const makeid = (length: number) => {
            let result = '';
            const characters = 'abcdefghifklmnopqrstuvwxyz';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            return result;
        }

        const getScope = "ne-one-get-" + envName;
        const logisticScopeName = "logistics_agent_uri";
        const resourceServer = "ne-one-resource-server";
        const server = this.userPool.addResourceServer("ne-one-resource-server", {
            identifier: resourceServer,
            scopes: [{
                scopeDescription: "Get neOne Scope",
                scopeName: getScope
            },
            {
                scopeDescription: "NeOne Logistics Scope",
                scopeName: logisticScopeName
            }]
        });
        this.scope = `${resourceServer}/${getScope}`;
        const logisticScope =  `${resourceServer}/${logisticScopeName}`;
        const uniqueId = makeid(6);
        const domain = this.userPool.addDomain("ne-one-domain-" + uniqueId + envName, {
            cognitoDomain: {
                domainPrefix: "ne-one-auth-"+ uniqueId  + envName
            }
        });

        const appClient = this.userPool.addClient('app-client', {
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
            oAuth: {
                flows: {
                    clientCredentials: true
                },
                scopes: [cognito.OAuthScope.custom(`${resourceServer}/${getScope}`), cognito.OAuthScope.custom(logisticScope)],
            },
            generateSecret: true,
            accessTokenValidity: cdk.Duration.days(1)
        });
        appClient.node.addDependency(server);
        
        const urlOutput = new CfnOutput(this, "provider-url", {
            value: this.userPool.userPoolProviderUrl,
        });
        const domainOutput = new CfnOutput(this, "cognito-domain-url", {
            value: `${domain.domainName}.auth.${Stack.of(this).region}.amazoncognito.com`,
        });
        const appOutput = new CfnOutput(this, "app-client-id", {
            value: appClient.userPoolClientId,
        });

        const appUserPoolId = new CfnOutput(this, 'userPoolId', {
            value: this.userPool.userPoolId,
        });
    }

    
}