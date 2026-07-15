resource "random_password" "db" {
  length  = 32
  special = false # evita caracteres que dão problema em connection string sem escape
}

resource "aws_db_subnet_group" "n8n" {
  name       = "${var.project_name}-db"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_instance" "n8n" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  db_name               = var.db_name
  username              = var.db_username
  password              = random_password.db.result
  db_subnet_group_name  = aws_db_subnet_group.n8n.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az                = false
  publicly_accessible     = false
  backup_retention_period = 7
  backup_window           = "05:00-06:00" # UTC ~ 02h-03h em São Paulo
  deletion_protection     = var.db_deletion_protection
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.project_name}-db-final"

  tags = { Name = "${var.project_name}-db" }
}
