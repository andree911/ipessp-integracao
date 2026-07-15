variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type        = string
  default     = "ipessp-n8n"
  description = "Prefixo usado em todos os recursos criados por este módulo."
}

# --- Rede ---
# VPC isolada dedicada só ao n8n — não depende de nenhuma rede existente na
# conta. Subnets públicas hospedam ALB + tasks Fargate (com IP público, sem
# NAT Gateway, pra manter custo baixo); subnets privadas isoladas hospedam
# só o RDS, que não precisa de saída pra internet.
variable "vpc_cidr" {
  type    = string
  default = "10.42.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.42.0.0/24", "10.42.1.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.42.10.0/24", "10.42.11.0/24"]
}

# --- n8n / Fargate ---
variable "n8n_image" {
  type        = string
  default     = "docker.io/n8nio/n8n:1.70.0"
  description = "Confira a versão do n8n rodando hoje no Render (rodapé da UI) antes de aplicar — usar a mesma versão evita migração de schema surpresa junto com a migração de infra."
}

variable "fargate_cpu" {
  type    = number
  default = 512 # 0.5 vCPU
}

variable "fargate_memory" {
  type    = number
  default = 1024 # 1 GB
}

variable "n8n_env_secrets" {
  type        = map(string)
  sensitive   = true
  description = <<-EOT
    Demais variáveis referenciadas pelos fluxos (ver docs/.env.example,
    docs-meta/.env.example e n8n.env.example do repo): CORE_API_URL,
    IA_BEARER_TOKEN, ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN,
    ZAPI_TELEFONE_EQUIPE (enquanto docs/ com Z-API ainda estiver ativo),
    WHATSAPP_SEND_URL, WHATSAPP_AUTH_HEADER_NAME, WHATSAPP_AUTH_HEADER_VALUE,
    WHATSAPP_TELEFONE_EQUIPE, WHATSAPP_TEMPLATE_* (quando docs-meta/ entrar
    em produção). Não inclua aqui DB_POSTGRESDB_*, N8N_HOST, WEBHOOK_URL,
    N8N_PROTOCOL, N8N_PORT, N8N_ENCRYPTION_KEY — esses o próprio Terraform
    calcula (ver secrets.tf).
  EOT
  default     = {}
}

# --- RDS ---
variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

variable "db_name" {
  type    = string
  default = "n8n"
}

variable "db_username" {
  type    = string
  default = "n8n_admin"
}

variable "db_deletion_protection" {
  type        = bool
  default     = true
  description = "Deixe true em produção. Só derrube pra false temporariamente se precisar destruir o RDS de propósito (ex.: refazer o ambiente do zero)."
}
