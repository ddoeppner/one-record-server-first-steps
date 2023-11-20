#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NeOneAppCdkStack } from '../lib/ne-one-app-cdk-stack';

const app = new cdk.App();

const envName = app.node.tryGetContext("envName");
if (!envName) {
  throw new Error('No environment name provided for stack');
}
new NeOneAppCdkStack(app, 'NeOneAppCdkStack' + envName, {
  envName: envName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

/**************
 * Tagging all resources in stack
 */
cdk.Tags.of(app).add('application-name', 'ne-one-services');
cdk.Tags.of(app).add('application-env', envName);
