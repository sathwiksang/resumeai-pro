class OrganizationPolicy < ApplicationPolicy
  def show?
    user.organization_id == record.id
  end

  def update?
    user.admin?
  end

  def destroy?
    false
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(id: user.organization_id)
    end
  end
end
