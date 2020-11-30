output "storage_account_name" {
  value = azurerm_storage_account.remote_state_sa.name
}

output "resource_group_name" {
  value = azurerm_resource_group.resource_group.name
}

output "container_name" {
  value = azurerm_storage_container.terraform_remote_state_container.name
}

output "key" {
  value = "terraform.tfstate"
}

