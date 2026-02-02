output "app_server_instance_id" {
  description = "App server EC2 instance ID"
  value       = aws_instance.app_server.id
}

output "app_server_public_ip" {
  description = "App server public IP"
  value       = aws_instance.app_server.public_ip
}

output "app_security_group_id" {
  description = "App server security group ID"
  value       = aws_security_group.app_sg.id
}

output "ansible_control_instance_id" {
  description = "Ansible control EC2 instance ID"
  value       = aws_instance.ansible_control.id
}

output "ansible_control_public_ip" {
  description = "Ansible control public IP"
  value       = aws_instance.ansible_control.public_ip
}
