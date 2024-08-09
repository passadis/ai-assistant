resource "azurerm_resource_group" "rgroup" {
  name     = "rg-idbapp"
  location = "Switzerland North"
}
resource "random_string" "str-name" {
  length  = 5
  upper   = false
  numeric = false
  lower   = true
  special = false
}

# Create Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "logs" {
  name                = "Logskp"
  location            = azurerm_resource_group.rgroup.location
  resource_group_name = azurerm_resource_group.rgroup.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Create Application Insights
resource "azurerm_application_insights" "appinsights" {
  name                = "appin${random_string.str-name.result}"
  location            = azurerm_resource_group.rgroup.location
  resource_group_name = azurerm_resource_group.rgroup.name
  workspace_id        = azurerm_log_analytics_workspace.logs.id
  application_type    = "other"
}

# Azure SQL Server
resource "azurerm_mssql_server" "sqlsrv" {
  name                         = "sql${random_string.str-name.result}"
  resource_group_name          = azurerm_resource_group.rgroup.name
  location                     = azurerm_resource_group.rgroup.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password

  azuread_administrator {
    login_username = "superdev@securevoip.eu"
    object_id      = "34ac7c44-82ff-40f1-8e3c-b74524c198c5"
  }
  public_network_access_enabled = true
}

#Create Azure SQL Firewall Rule
resource "azurerm_mssql_firewall_rule" "fwall" {
  name             = "FirewallRule1"
  server_id        = azurerm_mssql_server.sqlsrv.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}

# Azure SQL Database
resource "azurerm_mssql_database" "sqldb" {
  name               = "dbusesearch02"
  server_id          = azurerm_mssql_server.sqlsrv.id
  license_type       = "LicenseIncluded"
  sku_name           = "Basic"
  collation          = "SQL_Latin1_General_CP1_CI_AS"
  geo_backup_enabled = false

}

# Create a local provisioner for SQL Table
resource "null_resource" "sql-table" {
  provisioner "local-exec" {
    command = "sqlcmd -S ${azurerm_mssql_server.sqlsrv.fully_qualified_domain_name} -U ${var.sql_admin_username} -P ${var.sql_admin_password} -d ${azurerm_mssql_database.sqldb.name} -i createtable.sql"
  }
  depends_on = [azurerm_mssql_database.sqldb]
}

# Create Storage Account
resource "azurerm_storage_account" "storage" {
  name                     = "st${random_string.str-name.result}"
  resource_group_name      = azurerm_resource_group.rgroup.name
  location                 = azurerm_resource_group.rgroup.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }
}
# Create Storage Container
resource "azurerm_storage_container" "container" {
  name                  = "pics"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "container"
}
# Create Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "azr${random_string.str-name.result}"
  resource_group_name = azurerm_resource_group.rgroup.name
  location            = azurerm_resource_group.rgroup.location
  sku                 = "Standard"
  admin_enabled       = true
}

output "acrname" {
  value = azurerm_container_registry.acr.name
}

# Create AI Search
resource "azurerm_search_service" "aisearch" {
  name                = "ais${random_string.str-name.result}"
  resource_group_name = azurerm_resource_group.rgroup.name
  location            = azurerm_resource_group.rgroup.location
  sku                 = "standard"
}

# Create User Assigned Managed Identity
resource "azurerm_user_assigned_identity" "uami" {
  name                = "uami${random_string.str-name.result}"
  location            = azurerm_resource_group.rgroup.location
  resource_group_name = azurerm_resource_group.rgroup.name
}
# Assign SQL DB Contributor Role to User Assigned Managed Identity
resource "azurerm_role_assignment" "sqlcontributor" {
  scope                = azurerm_mssql_database.sqldb.id
  role_definition_name = "SQL DB Contributor"
  principal_id         = azurerm_user_assigned_identity.uami.principal_id
}

# Call Key Vault Module
module "keyvault" {
  source                            = "./modules/keyvault"
  sql_admin_username                = var.sql_admin_username
  sql_admin_password                = var.sql_admin_password
  azurerm_resource_group            = azurerm_resource_group.rgroup.name
  storage_account_name              = azurerm_storage_account.storage.name
  sql_database_name                 = azurerm_mssql_database.sqldb.name
  sql_server_name                   = azurerm_mssql_server.sqlsrv.fully_qualified_domain_name
  azurerm_storage_account           = azurerm_storage_account.storage.name
  azurerm_mssql_database            = azurerm_mssql_database.sqldb.name
  azurerm_user_assigned_identity    = azurerm_user_assigned_identity.uami.name
  random_string                     = random_string.str-name.result
  location                          = azurerm_resource_group.rgroup.location
  azurerm_storage_account_string    = azurerm_storage_account.storage.primary_connection_string
  azurerm_user_assigned_identity_id = azurerm_user_assigned_identity.uami.principal_id
}

