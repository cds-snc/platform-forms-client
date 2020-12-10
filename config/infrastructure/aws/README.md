# Deploying GCFroms on Amazon Web Services (AWS)

:warning: This is not a fully featured production environment and aims to provide an accessible overview of the service.

This document describes how to deploy and operate a **reference implementation** of the COVID Alert Portal.

There should be an illustration of the Covid Shield infrastructure deployed on AWS right here (TODO)

At a glance, health care professionals (on the left) interact with a web portal, and mobile app users (on the right) interact with the diagnosis key retrieval and submission services.

## IT Service Requirements

(TODO)

| Service                  | AWS product offering                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| Serverless compute       | [Fargate](https://aws.amazon.com/fargate/)                             |
| Container registry       | [Elastic Container Registry](https://aws.amazon.com/ecr/)              |
| Domain name services     | [Route 53](https://aws.amazon.com/route53/)                            |
| TLS certificates         | [Certificate Manager](https://aws.amazon.com/certificate-manager/)     |
| Load balancing           | [Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/) |
| Content delivery network | [CloudFront](https://aws.amazon.com/cloudfront/)                       |
| Web application firewall | [WAF](https://aws.amazon.com/waf/)                                     |

## Deploying COVID Alert Portal

While this infrastructure may be deployed in a number of different ways, this document demonstrates a deploy using a small series of command line operations to generate credentials, and a CI/CD pipeline using [GitHub Actions](https://github.com/features/actions), [Docker](https://www.docker.com/why-docker), and [Terraform](https://www.terraform.io/).

### Prerequisites

- A [GitHub repository](https://help.github.com/en/github/getting-started-with-github/create-a-repo) with [Actions](https://github.com/features/actions) enabled

- [`aws` Command Line Interface](https://aws.amazon.com/cli/) installed and available in your path

- [`terraform`](https://www.terraform.io/downloads.html) 0.12.x installed and available in your path

#### Optional TODO: make a quick playbook doc to see if the containers are up or down? or pivot to the ui?

- [`ecs-cli`](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI.html) installed and available in your path

## Deploying to AWS manually

The credentials for the AWS Terraform provider are expected to be provided through the standard AWS credential environment variables.

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY_ID`

Credentials for a service account are included in the repo's Secrets so that we can kick off container uploads through GitHub Actions.

Merges to the `main` branch will

- Run the suite of unit tests we have
- Build a container, tagged with the latest commit hash
- Upload it to our [Elastic Container Registry](https://aws.amazon.com/ecr/)


