resource "azurerm_resource_group" "resource_group" {
  name     = "${var.name}-resources-RG"
  location = var.location
}

output "resource_group_name" {
  value = azurerm_resource_group.resource_group.name
}

