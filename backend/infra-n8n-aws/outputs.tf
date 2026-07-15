output "n8n_url" {
  description = "URL pública do n8n depois do apply — usar esta no lugar de https://n8n-ipessp.onrender.com em todo lugar (Supabase Database Webhook, N8N_LEADS_WEBHOOK_URL no backend, painel do 360dialog)."
  value       = "https://${aws_cloudfront_distribution.n8n.domain_name}"
}

output "alb_dns_name" {
  description = "DNS do ALB — só pra debug direto (sem HTTPS). Não usar como URL final."
  value       = aws_lb.n8n.dns_name
}

output "rds_endpoint" {
  description = "Host:porta do Postgres novo — usar no pg_dump/psql de restauração (ver README, seção migração de dados)."
  value       = aws_db_instance.n8n.endpoint
}

output "rds_password" {
  description = "Senha gerada pro usuário do Postgres novo. Sensível — só aparece com `terraform output -raw rds_password`."
  value       = random_password.db.result
  sensitive   = true
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.n8n.name
}

output "ecs_service_name" {
  value = aws_ecs_service.n8n.name
}

output "cloudwatch_log_group" {
  description = "Onde ver os logs do container n8n (stdout/stderr) se algo der errado no boot."
  value       = aws_cloudwatch_log_group.n8n.name
}

output "secrets_manager_secret_arn" {
  value = aws_secretsmanager_secret.n8n_env.arn
}
