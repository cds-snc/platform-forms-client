# Bootstrap

**Run these scripts first!**

This will create a ResourceGroup and StorageAccount to be used as a remote state backend.

Variables:

- **name**: ServiceName - will be used when creating other resource names
- **location**: Location - ie, canadaeast, canadacentral

These variables can be set in a terraform.tfvars file. There is an example file included.

The name variable will be used to name various resources:

- The Resource Group name will be in the form: `[ServiceName]-remote-state-RG`
- The Storage Account name will be in the form: `[lower(ServiceName)]tfstorage`
- The Storage Container name will be in the form: `[lower(ServiceName)]-remote-state-container`

Note that it is best to use the same Service Name in both this bootstrap step, and in the deploy infrastructure step.

```sh
terraform init
terraform plan
terraform apply
```

Outputs:

- storage_account_name
- resource_group_name
- container_name
- key

You will use these outputs in the backend.tfvars file in the main directory.
