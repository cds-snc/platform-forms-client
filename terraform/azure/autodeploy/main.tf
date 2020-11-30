provider "azurerm" {
  version = "~> 1.27"
}

resource "azurerm_container_registry_webhook" "container_registry_webhook" {
  name                = "autodeploy"
  resource_group_name = var.resource_group
  registry_name       = var.container_registry
  location            = var.location

  service_uri = var.webhook_uri
  status      = "enabled"
  actions     = ["push"]
  custom_headers = {
    "Content-Type" = "application/json"
  }
}

