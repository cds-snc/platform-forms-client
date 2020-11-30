resource "azurerm_application_insights" "covid-benefit" {
  name                = "${var.name}.app_insight"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  retention_in_days   = 90
  application_type    = "Node.JS"
}

resource "azurerm_application_insights" "non_prod" {

  name                = "${var.name}.non_prod"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  retention_in_days   = 90
  application_type    = "Node.JS"
}