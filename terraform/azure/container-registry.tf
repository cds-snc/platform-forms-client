resource "azurerm_container_registry" "container_registry" {
  name                = "${var.name}Registry"
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = azurerm_resource_group.resource_group.location
  sku                 = "Standard"
  admin_enabled       = true
}

output "container_registry_id" {
  value = azurerm_container_registry.container_registry.id
}

output "container_registry_login_server" {
  value = azurerm_container_registry.container_registry.login_server
}

output "container_registry_admin_username" {
  value = azurerm_container_registry.container_registry.admin_username
}

output "container_registry_admin_password" {
  value = azurerm_container_registry.container_registry.admin_password
}

output "container_registry_name" {
  value = azurerm_container_registry.container_registry.name
}

