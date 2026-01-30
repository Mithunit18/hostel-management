# ---------------------------
# Security Group
# ---------------------------
resource "aws_security_group" "hostel_sg" {
  name        = "${var.project_name}-${var.environment}-sg"
  description = "Security group for hostel outpass EC2"

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "Frontend access"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ---------------------------
# EC2 Instance
# ---------------------------
resource "aws_instance" "hostel_ec2" {
  ami                    = "ami-019715e0d74f695be" # Ubuntu 24.04 (Mumbai)
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.hostel_sg.id]

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2"
    Project     = var.project_name
    Environment = var.environment
  }
}


# ---------------------------
# Security Group - Ansible Control (SSH only)
# ---------------------------
resource "aws_security_group" "ansible_sg" {
  name        = "${var.project_name}-${var.environment}-ansible-sg"
  description = "Security group for Ansible control node (SSH only)"

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-ansible-sg"
    Project     = var.project_name
    Environment = var.environment
    Role        = "Ansible-Control"
  }
}

# ---------------------------
# EC2 Instance - Ansible Control Node
# ---------------------------
resource "aws_instance" "ansible_control_ec2" {
  ami                    = "ami-019715e0d74f695be" # Ubuntu 24.04 (Mumbai)
  instance_type          = var.instance_type       # t3.micro (free tier)
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.ansible_sg.id]

  tags = {
    Name        = var.ansible_instance_name
    Project     = var.project_name
    Environment = var.environment
    Role        = "Ansible-Control"
  }
}

