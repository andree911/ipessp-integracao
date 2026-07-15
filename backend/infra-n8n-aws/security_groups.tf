resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb"
  description = "ALB público — recebe da CloudFront (e diretamente da internet na porta 80)"
  vpc_id      = aws_vpc.n8n.id

  ingress {
    description = "HTTP — CloudFront termina o HTTPS e fala com o ALB em texto plano"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-alb-sg" }
}

resource "aws_security_group" "ecs_task" {
  name        = "${var.project_name}-ecs-task"
  description = "Task Fargate do n8n — só aceita tráfego do ALB"
  vpc_id      = aws_vpc.n8n.id

  ingress {
    description     = "n8n"
    from_port       = 5678
    to_port         = 5678
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "n8n precisa sair pra internet: CORE_API_URL, WHATSAPP_SEND_URL, OpenAI, etc."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ecs-task-sg" }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds"
  description = "Postgres do n8n — só aceita tráfego das tasks Fargate"
  vpc_id      = aws_vpc.n8n.id

  ingress {
    description     = "Postgres"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_task.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}
