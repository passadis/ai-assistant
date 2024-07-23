variable "sql_admin_username" {
  description = "SQL Admin Username"
  type        = string
}

variable "sql_admin_password" {
  description = "SQL Admin Password"
  type        = string
}
variable "azurerm_resource_group" {
  description = "Name of the resource group"
  type        = string
}

variable "storage_account_name" {
  description = "Name of the storage account"
  type        = string
}
variable "sql_database_name" {
  description = "Name of the SQL database"
  type        = string
}
variable "sql_server_name" {
  description = "Name of the SQL server"
  type        = string
}
variable "azurerm_storage_account" {
  description = "Name of the storage account"
  type        = string  
}
variable "azurerm_user_assigned_identity" {
  description = "Name of the user assigned identity"
  type        = string    
}
variable "azurerm_mssql_database" {
  description = "Name of the SQL database"
  type        = string    
  
}
variable "random_string" {
  description = "Random string"
  type        = string    
  
}
variable "location" {
  description = "Location"
  type        = string    
  
}
variable "azurerm_storage_account_string" {
  description = "Storage Account Connection String"
  type        = string    
  
}
variable "azurerm_user_assigned_identity_id" {
  description = "User Assigned Identity ID"
  type        = string    
  
}