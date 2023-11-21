import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NeOneArtefacts } from './ne-one-artefacts';
import { NeOneAuth } from './ne-one-auth';
import { NeOneDatabase } from './ne-one-database';

export interface NeOneStackProps extends cdk.StackProps {
  envName: string
}

export class NeOneCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NeOneStackProps) {
      super(scope, id, props);

      const repos = new NeOneArtefacts(this, "repos-" + props.envName, {envName: props.envName})

      //const auth = new NeOneAuth(this, "auth-" + props.envName, {envName: props.envName});

      const db = new NeOneDatabase(this, "db-" + props.envName, {envName: props.envName} )
    }
}
