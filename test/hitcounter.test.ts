import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../lib/hitcounter';

test('DynamoDB table created', () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda'),
    }),
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
});

test('Lambda has environment variables', () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda'),
    }),
  });

  const template = Template.fromStack(stack);

  const envCapture = new Capture();
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: 'TestFunction22AD90FC',
      },
      HITS_TABLE_NAME: {
        Ref: 'MyTestConstructHits24A357F0',
      },
    },
  });
});
