terraform {
  # required_version = "~> 0.12.5"
}

provider "azurerm" {
  version = "~> 1.27"
}

resource "azurerm_resource_group" "resource_group" {
  name     = "${var.name}-remote-state-RG"
  location = var.location
}

resource "azurerm_storage_account" "remote_state_sa" {
  name                     = "${lower(var.name)}tfstorage"
  resource_group_name      = azurerm_resource_group.resource_group.name
  location                 = var.location
  account_tier             = var.storage_account_tier
  account_replication_type = var.storage_account_replication_type
  #lifecycle {
  #  prevent_destroy = true
  #}
}

resource "azurerm_storage_container" "terraform_remote_state_container" {
  name                  = "${lower(var.name)}-remote-state-container"
  storage_account_name  = azurerm_storage_account.remote_state_sa.name
  container_access_type = "private"
  #lifecycle {
  #  prevent_destroy = true
  #}
}

