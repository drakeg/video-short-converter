resource "aws_sns_topic" "budget_kill_switch" {
  count = var.enable_budget_kill_switch ? 1 : 0

  name = "${local.name_prefix}-budget-kill-switch"

  tags = local.common_tags
}