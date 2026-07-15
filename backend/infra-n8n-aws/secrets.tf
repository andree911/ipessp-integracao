# Todas as env vars do n8n num secret só (JSON), lido pela task definition
# (ver ecs.tf). As de infra (DB_*, N8N_HOST, WEBHOOK_URL, N8N_PROTOCOL,
# N8N_PORT, N8N_ENCRYPTION_KEY) o Terraform calcula; o resto vem de
# var.n8n_env_secrets, preenchido no terraform.tfvars (não versionado).
#
# N8N_ENCRYPTION_KEY é gerada aqui (não precisa bater com a do Render) porque
# a migração parte de um banco vazio — não tem credencial antiga criptografada
# pra descriptografar. Se um dia migrarem dados de um banco existente, troquem
# isso por uma variável copiada do ambiente de origem antes do apply.
resource "random_password" "encryption_key" {
  length  = 32
  special = false
}

locals {
  n8n_env_computed = {
    DB_TYPE                                   = "postgresdb"
    DB_POSTGRESDB_HOST                        = aws_db_instance.n8n.address
    DB_POSTGRESDB_PORT                        = tostring(aws_db_instance.n8n.port)
    DB_POSTGRESDB_DATABASE                    = var.db_name
    DB_POSTGRESDB_USER                        = var.db_username
    DB_POSTGRESDB_PASSWORD                    = random_password.db.result
    DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED     = "false"
    N8N_ENCRYPTION_KEY                        = random_password.encryption_key.result
    N8N_HOST                                  = aws_cloudfront_distribution.n8n.domain_name
    N8N_PROTOCOL                              = "https"
    N8N_PORT                                  = "5678"
    WEBHOOK_URL                               = "https://${aws_cloudfront_distribution.n8n.domain_name}"
    N8N_BLOCK_ENV_ACCESS_IN_NODE              = "false"
  }

  n8n_env_all = merge(var.n8n_env_secrets, local.n8n_env_computed)
}

resource "aws_secretsmanager_secret" "n8n_env" {
  name = "${var.project_name}-env"
}

resource "aws_secretsmanager_secret_version" "n8n_env" {
  secret_id     = aws_secretsmanager_secret.n8n_env.id
  secret_string = jsonencode(local.n8n_env_all)
}
