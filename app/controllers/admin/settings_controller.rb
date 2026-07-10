module Admin
  class SettingsController < ApplicationController
    before_action :require_admin

    def show
      render inertia: "Admin/Settings/Show", props: {
        organization: {
          id: current_organization.id,
          name: current_organization.name,
          subdomain: current_organization.subdomain,
          plan: current_organization.plan,
          settings: current_organization.settings,
        },
        user: {
          id: current_user.id,
          first_name: current_user.first_name,
          last_name: current_user.last_name,
          email_address: current_user.email_address,
          avatar_url: current_user.avatar_url,
          preferences: current_user.preferences,
        },
      }
    end

    def update
      case params[:section]
      when "organization"
        if current_organization.update(organization_params)
          redirect_to admin_settings_path, notice: "Organization settings updated."
        else
          redirect_to admin_settings_path, alert: current_organization.errors.full_messages.join(", ")
        end
      when "profile"
        if current_user.update(profile_params)
          redirect_to admin_settings_path, notice: "Profile updated."
        else
          redirect_to admin_settings_path, alert: current_user.errors.full_messages.join(", ")
        end
      when "password"
        if current_user.update(password_params)
          redirect_to admin_settings_path, notice: "Password updated."
        else
          redirect_to admin_settings_path, alert: current_user.errors.full_messages.join(", ")
        end
      else
        redirect_to admin_settings_path, alert: "Unknown settings section."
      end
    end

    private

    def require_admin
      unless current_user&.admin?
        redirect_to root_path, alert: "Admin access required."
      end
    end

    def organization_params
      params.require(:organization).permit(:name, :subdomain)
    end

    def profile_params
      params.require(:user).permit(:first_name, :last_name, :email_address)
    end

    def password_params
      params.require(:user).permit(:password, :password_confirmation)
    end

    def skip_pundit?
      true
    end
  end
end
