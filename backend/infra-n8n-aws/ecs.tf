resource "aws_ecs_cluster" "n8n" {
  name = "${var.project_name}-cluster"
}

resource "aws_cloudwatch_log_group" "n8n" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 30
}

# Role que o agente do ECS usa pra dar boot no container (puxar imagem,
# buscar os secrets, mandar log) — não é a role que o n8n usa em runtime.
resource "aws_iam_role" "ecs_execution" {
  name = "${var.project_name}-ecs-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name = "${var.project_name}-read-secret"
  role = aws_iam_role.ecs_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [aws_secretsmanager_secret.n8n_env.arn]
    }]
  })
}

# Role que o processo do n8n usa em runtime — não precisa de nenhuma
# permissão de AWS hoje (n8n só fala com CORE_API_URL, WhatsApp, OpenAI etc,
# tudo fora da AWS), mas o ECS exige uma task role mesmo assim.
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_ecs_task_definition" "n8n" {
  family                   = var.project_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "n8n"
      image     = var.n8n_image
      essential = true
      portMappings = [{
        containerPort = 5678
        protocol      = "tcp"
      }]
      secrets = [
        for key in keys(local.n8n_env_all) : {
          name      = key
          valueFrom = "${aws_secretsmanager_secret.n8n_env.arn}:${key}::"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.n8n.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "n8n"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "n8n" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.n8n.id
  task_definition = aws_ecs_task_definition.n8n.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_task.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.n8n.arn
    container_name    = "n8n"
    container_port    = 5678
  }

  depends_on = [aws_lb_listener.http, aws_iam_role_policy.ecs_execution_secrets]
}
