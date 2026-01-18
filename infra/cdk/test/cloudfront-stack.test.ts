import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CloudFrontStackConfig, ThrowtrashCloudFrontStack } from '../lib/cloudfront-stack';

describe('ThrowtrashCloudFrontStack', () => {
  test('CloudFront Function が外部ファイルのコードで作成される', () => {
    const app = new cdk.App();
    const config: CloudFrontStackConfig = {
      stage: 'test',
      domainName: 'example.com',
      certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/example',
      frontendBucketName: 'example-bucket',
      backendApiDomain: 'backend.example.com',
      mobileApiDomain: 'mobile.example.com',
      alarmApiDomain: 'alarm.example.com'
    };

    const stack = new ThrowtrashCloudFrontStack(app, 'TestStack', config);
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::CloudFront::Function', {
      Name: Match.stringLikeRegexp('throwtrash-path-rewrite-test'),
      FunctionCode: Match.stringLikeRegexp('function handler')
    });
  });

  test('Distribution が Function を関連付けている', () => {
    const app = new cdk.App();
    const config: CloudFrontStackConfig = {
      stage: 'test',
      domainName: 'example.com',
      certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/example',
      frontendBucketName: 'example-bucket',
      backendApiDomain: 'backend.example.com',
      mobileApiDomain: 'mobile.example.com',
      alarmApiDomain: 'alarm.example.com'
    };

    const stack = new ThrowtrashCloudFrontStack(app, 'TestStackDistribution', config);
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultCacheBehavior: {
          FunctionAssociations: Match.arrayWith([
            Match.objectLike({
              EventType: 'viewer-request'
            })
          ])
        },
        CacheBehaviors: Match.arrayWith([
          Match.objectLike({
            PathPattern: '/backend/*',
            FunctionAssociations: Match.arrayWith([
              Match.objectLike({ EventType: 'viewer-request' })
            ])
          }),
          Match.objectLike({
            PathPattern: '/mobile/*',
            FunctionAssociations: Match.arrayWith([
              Match.objectLike({ EventType: 'viewer-request' })
            ])
          }),
          Match.objectLike({
            PathPattern: '/alarm/*',
            FunctionAssociations: Match.arrayWith([
              Match.objectLike({ EventType: 'viewer-request' })
            ])
          })
        ])
      }
    });
  });
});
