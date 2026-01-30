output "ec2_instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.hostel_ec2.id
}

output "ec2_public_ip" {
  description = "EC2 Public IP"
  value       = aws_instance.hostel_ec2.public_ip
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.hostel_sg.id
}

output "ansible_control_instance_id" {
  description = "Ansible Control EC2 Instance ID"
  value       = aws_instance.ansible_control_ec2.id
}

output "ansible_control_public_ip" {
  description = "Ansible Control EC2 Public IP"
  value       = aws_instance.ansible_control_ec2.public_ip
}
