import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as neptune from '@aws-cdk/aws-neptune-alpha';
import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';

export interface NeOneDatabaseProps {
    envName: string
}

export class NeOneDatabase extends Construct {
    
    constructor(scope: Construct, id: string, props: NeOneDatabaseProps) {
        super(scope, id);

        const privateSubnetConfiguration = {
            cidrMask: 24,
            name: 'private-subnet',
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        };
        const publicSubnetConfiguration = {
            cidrMask: 24,
            name: 'public-subnet',
            subnetType: ec2.SubnetType.PUBLIC,
        }; 
        const vpc = new ec2.Vpc(this, "ne-one-vpc-" + props.envName, {
            subnetConfiguration: [privateSubnetConfiguration, publicSubnetConfiguration],
            maxAzs: 2,
            natGateways: 1
        });

        cdk.Tags.of(vpc).add('type', 'NeOne');
        const securityGroup = new ec2.SecurityGroup(this, "NeOneSecurityGroup", {
            vpc: vpc,
            allowAllIpv6Outbound: true,
            allowAllOutbound: true,
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8182));
        securityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(8182));

        const cluster = new neptune.DatabaseCluster(this, 'ServerlessDatabase', {
            vpc,
            instanceType: neptune.InstanceType.SERVERLESS,
            serverlessScalingConfiguration: {
                minCapacity: 1,
                maxCapacity: 5,
            },
            securityGroups: [securityGroup]
        });
        
        const writeAddress = new CfnOutput(this, "writeAddress", {
            value: cluster.clusterEndpoint.socketAddress
        });

        const readAddress = new CfnOutput(this, "readAddress", {
            value: cluster.clusterReadEndpoint.socketAddress
        });
    }
}