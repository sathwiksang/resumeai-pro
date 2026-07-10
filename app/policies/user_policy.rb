class UserPolicy < ApplicationPolicy
  # User is not acts_as_tenant, so every check must confirm the record lives
  # in the acting user's organization before role rules apply.
  def show?
    same_org? && (user.admin? || record.id == user.id)
  end

  def create?
    user.admin?
  end

  def update?
    same_org? && (user.admin? || record.id == user.id)
  end

  def destroy?
    same_org? && user.admin? && record.id != user.id
  end

  private

  def same_org?
    record.organization_id == user.organization_id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      org_scope = scope.where(organization_id: user.organization_id)
      user.admin? ? org_scope : org_scope.where(id: user.id)
    end
  end
end
