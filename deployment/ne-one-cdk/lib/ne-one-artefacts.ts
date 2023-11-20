import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export interface NeOneArtefactsProps extends cdk.StackProps {
    envName: string
}

export class NeOneArtefacts extends Construct {
    constructor(scope: Construct, id: string, props: NeOneArtefactsProps) {
    super(scope, id);

        const envName = props.envName;
        const appRepository = new ecr.Repository(this, 'ne-one-app-' + envName, {
            repositoryName: "ne-one-app-" + envName,
            imageScanOnPush: true,
        });

        const appRepositoryName = new cdk.CfnOutput(this, 'appRepositoryName', {
            value: appRepository.repositoryName
        });

        const appRepositoryUri = new cdk.CfnOutput(this, 'appRepositoryUri', {
            value: appRepository.repositoryUri,
        });

    }
}