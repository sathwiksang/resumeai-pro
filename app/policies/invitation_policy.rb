class InvitationPolicy < ApplicationPolicy
  def index?
    user.admin? || user.recruiter?
  end

  def create?
    user.admin? || user.recruiter?
  end

  def destroy?
    user.admin?
  end

  def resend?
    user.admin? || user.recruiter?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end
end
