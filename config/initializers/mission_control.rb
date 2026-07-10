# The /admin/jobs mount is gated by AdminSessionConstraint (admin session
# cookie required), so Mission Control's own HTTP basic auth is redundant.
# Disable it — otherwise it 401s even authenticated admins because no static
# basic-auth credentials are configured.
#
# Also detach it from the host ApplicationController: inheriting our base
# controller drags in Pundit's verify_authorized/verify_policy_scoped
# after_actions, which Mission Control's own controllers don't satisfy.
#
# These must be set during initialization (before eager-loading builds the
# engine's controllers), not in after_initialize — under eager_load the
# controllers would already be defined against the wrong base class.
MissionControl::Jobs.http_basic_auth_enabled = false
MissionControl::Jobs.base_controller_class = "ActionController::Base"
