const path = require('path')
const ec2 = require('@aws-cdk/aws-ec2')
const ecs = require('@aws-cdk/aws-ecs')
const ecsPatterns = require('@aws-cdk/aws-ecs-patterns')
const dynamodb = require('@aws-cdk/aws-dynamodb')
const cdk = require('@aws-cdk/core')
const { copyApp } = require('./copy')

const synth = function(name = 'node-starter-app') {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, `${name}FargateServiceStack`)
  const vpc = new ec2.Vpc(stack, name, { maxAzs: 1 })
  const cluster = new ecs.Cluster(stack, 'Cluster', { vpc })

  new ecsPatterns.NetworkLoadBalancedFargateService(
    stack,
    `${name}FargateService`,
    {
      cluster,
      image: ecs.ContainerImage.fromAsset(
        path.resolve(__dirname, 'local-image'),
      ),
      containerPort: 3000,
      assignPublicIp: true,
    },
  )

  new dynamodb.Table(stack, 'Submissions', {
    partitionKey: { name: 'fullname', type: dynamodb.AttributeType.STRING },
  })

  app.synth()
}

copyApp(() => {
  console.log("App copied we're ready")
  synth()
})
