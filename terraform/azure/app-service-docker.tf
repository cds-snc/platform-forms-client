resource "azurerm_app_service" "app_service" {
  name                = "${var.name}-appservice"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  app_service_plan_id = azurerm_app_service_plan.app_service_plan.id
  https_only          = "true"

  site_config {
    http2_enabled = true
    always_on     = true
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "ADOBE_ENV"                       = "production"
    "APPINSIGHTS_INSTRUMENTATIONKEY"  = azurerm_application_insights.covid-benefit.instrumentation_key
    "APP_SERVICE"                     = "true"
    "CDN_PREFIX"                      = "//cv19-benefits-cdn.azureedge.net"
    "COOKIE_SECRET"                   = "lhnhtvsnaavmlxjrqct"
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.container_registry.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.container_registry.admin_username
    #"DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.container_registry.admin_password
    "DOCKER_REGISTRY_SERVER_PASSWORD" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.key_vault.vault_uri}secrets/${azurerm_key_vault_secret.docker_password.name}/${azurerm_key_vault_secret.docker_password.version})"
    "FF_ENABLE_DTC"                   = "false"
    "SLOT_NAME"                       = "default"

  }

  logs {
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 100
      }
    }
  }
}
resource "azurerm_app_service_slot" "staging" {
  name                = "staging"
  app_service_name    = azurerm_app_service.app_service.name
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  app_service_plan_id = azurerm_app_service_plan.asp_non_prod.id

  site_config {
    #linux_fx_version = "DOCKER|${azurerm_container_registry.container_registry.login_server}/${var.docker_image}:staging"
    http2_enabled = true
    always_on     = true
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY"  = azurerm_application_insights.non_prod.instrumentation_key
    "APP_SERVICE"                     = "true"
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.container_registry.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.container_registry.admin_username
    #"DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.container_registry.admin_password
    "DOCKER_REGISTRY_SERVER_PASSWORD" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.key_vault.vault_uri}secrets/${azurerm_key_vault_secret.docker_password.name}/${azurerm_key_vault_secret.docker_password.version})"
    "FF_ENABLE_DTC"                   = "false"
    "SLOT_NAME"                       = "staging"
  }

  logs {
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 50
      }
    }
  }
}


resource "azurerm_app_service_slot" "dev" {
  name                = "dev"
  app_service_name    = azurerm_app_service.app_service.name
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  app_service_plan_id = azurerm_app_service_plan.devtest.id

  site_config {
    #linux_fx_version = "DOCKER|${azurerm_container_registry.container_registry.login_server}/${var.docker_image}:staging"
    http2_enabled = true
    always_on     = true
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "APP_SERVICE"                     = "true"
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.container_registry.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.container_registry.admin_username
    #"DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.container_registry.admin_password
    "DOCKER_REGISTRY_SERVER_PASSWORD" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.key_vault.vault_uri}secrets/${azurerm_key_vault_secret.docker_password.name}/${azurerm_key_vault_secret.docker_password.version})"
    "FF_ENABLE_DTC"                   = "false"
    "SLOT_NAME"                       = "dev"
  }

  logs {
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 50
      }
    }
  }
}


output "default_site_hostname" {
  value = azurerm_app_service.app_service.default_site_hostname
}

output "staging_site_hostname" {
  value = azurerm_app_service_slot.staging.default_site_hostname
}

output "development_site_hostname" {
  value = azurerm_app_service_slot.dev.default_site_hostname
}