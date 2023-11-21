import { Construct } from 'constructs';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export interface NeOneServicesProps {
    envName: string;
    appContainerRepositoryName: string;
    authContainerRepositoryName: string;
    dbReadEndpoint: string;
    dbWriteEndpoint: string;
}

export class NeOneServices extends Construct {
    constructor(scope: Construct, id: string, props: NeOneServicesProps) {
    super(scope, id);

    const envName = props?.envName;

    const vpc = ec2.Vpc.fromLookup(this, 'ImportVPC', {
        tags: { "type": "NeOne" }
    });

    const securityGroup = new ec2.SecurityGroup(this, 'ne-one-vpc-connector-sg' + props?.envName, {
        vpc: vpc,
        allowAllIpv6Outbound: true,
        allowAllOutbound: true,
    });
    
    const vpcConnector = new apprunner.VpcConnector(this, 'VpcConnector' + props?.envName, {
        vpc,
        vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS  }),
        vpcConnectorName: 'NeOneVpcConnector' + props?.envName,
        securityGroups: [securityGroup]
    });

    let tagName = this.node.tryGetContext("tagName");
    if (!tagName) {
        tagName = envName;
    }
    const username = "admin";
    const secret = new secretsmanager.Secret(this, "keycloakcreds" + envName, {
        generateSecretString: {
            secretStringTemplate: JSON.stringify({username: username}),
            generateStringKey: "password",
            excludeCharacters:' \'%+:;{}."@/#<>`?!~&,[]](-)*^_\\|&$'
        }
    });

    const authService = new apprunner.Service(this, 'ne_one_auth_app', {
        serviceName: "neoneauthapp_" + envName,
        source: apprunner.Source.fromEcr({
            imageConfiguration: {
                port: 8080,
                environmentSecrets: {
                    KEYCLOAK_ADMIN_PASSWORD: apprunner.Secret.fromSecretsManager(secret, "password"),
                },
                environmentVariables:  {
                    KEYCLOAK_ADMIN: username,
                    KC_HEALTH_ENABLED: "true",  
                },
                startCommand: "start-dev --proxy=edge --hostname-strict=false"
            },
            repository: ecr.Repository.fromRepositoryName(this, "authImport", props.authContainerRepositoryName),
            tagOrDigest: envName,
        }),
        healthCheck: apprunner.HealthCheck.http({
            healthyThreshold: 5,
            path: '/health',
            unhealthyThreshold: 20,
        }),

    });

    const appService = new apprunner.Service(this, 'ne_one_server_app', {
        serviceName: "neoneserverapp_" + envName,
        vpcConnector: vpcConnector,
        source: apprunner.Source.fromEcr({
            imageConfiguration: {
                port: 8080,
                environmentVariables: {
                    "REPOSITORY_TYPE": "sparql",
                    "SPARQL_QUERY_ENDPOINT": `https://${props.dbReadEndpoint}/sparql`,
                    "SPARQL_UPDATE_ENDPOINT": `https://${props.dbWriteEndpoint}/sparql`,
                    "LO_ID_CONFIG_HOST": "localhost",
                    "LO_ID_CONFIG_PORT": "8080",
                    "LO_ID_CONFIG_SCHEME": "http",
                    "AUTH_VALID_ISSUERS_LOCAL": "http://localhost:8089/realms/neone",
                    "AUTH_ISSUERS_LOCAL_PUBLICKEY_LOCATION": "https://" + authService.serviceUrl + "/realms/neone/protocol/openid-connect/certs",
                    "QUARKUS_OIDC_CLIENT_AUTH_SERVER_URL": "https://" + authService.serviceUrl + "/realms/neone",
                    "QUARKUS_OIDC_CLIENT_CLIENT_ID": "neone-client",
                    "QUARKUS_OIDC_CLIENT_CREDENTIALS_SECRET": "lx7ThS5aYggdsMm42BP3wMrVqKm9WpNY",                                                                             
                    "QUARKUS_HTTP_PORT": "8080",            
                    "QUARKUS_REDIS_HOSTS": "redis://localhost:6379",
                    "AUTO_ACCEPT_ACTION_REQUESTS": "true",
                    "BLOBSTORE_CREATE_BUCKET": "false",
                },
            },
            repository: ecr.Repository.fromRepositoryName(this, "appImport", props.appContainerRepositoryName),
            tagOrDigest: tagName,
            
            }),
        });
        appService.node.addDependency(securityGroup);
        appService.node.addDependency(vpcConnector);

    }
}