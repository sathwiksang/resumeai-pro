class ResumeScorePolicy < ApplicationPolicy
  def show?
    user.recruiter? || user.admin? || record.user_id == user.id
  end

  def create?
    organization_member? && record.organization.can_analyze?
  end

  def destroy?
    user.admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.recruiter? || user.admin?
        scope.all
      else
        scope.where(user: user)
      end
    end
  end
end
