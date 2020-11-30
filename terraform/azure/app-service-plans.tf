
resource "azurerm_app_service_plan" "app_service_plan" {
  name                = "${var.name}-asp"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "PremiumV2"
    size = "P1v2"
  }

  tags = {
    "project-code" = "esdc-covid-19-cds"
  }
}
resource "azurerm_app_service_plan" "asp_non_prod" {
  name                = "${var.name}-non-prod"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "PremiumV2"
    size = "P1v2"
  }

  tags = {
    "project-code" = "esdc-covid-19-cds"
  }
}

resource "azurerm_app_service_plan" "devtest" {
  name                = "${var.name}-devtest"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Standard"
    size = "S1"
  }

  tags = {
    "project-code" = "esdc-covid-19-cds"
  }
}

