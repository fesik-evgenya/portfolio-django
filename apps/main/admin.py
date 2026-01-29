from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    AdminUser, AboutContent, AboutMeta, EducationItem,
    WorkPhilosophySlot, TechnologyTool, ContactInfo,
    SiteSettings, ContactMessage,
    # Модели из других приложений, которые находятся в main/models.py
    PortfolioCategory, PortfolioItem, PortfolioImage,
    SolutionCategory, Solution, SolutionImage, SolutionOrder
)


# Кастомная админка для AdminUser
@admin.register(AdminUser)
class AdminUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_super_admin')
    list_filter = ('is_staff', 'is_superuser', 'is_super_admin', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Персональная информация', {'fields': ('first_name', 'last_name', 'email', 'telegram', 'avatar')}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_super_admin', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_super_admin'),
        }),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)


# Inline модели для AboutContent
class EducationItemInline(admin.TabularInline):
    model = EducationItem
    extra = 1
    ordering = ['order']


class WorkPhilosophySlotInline(admin.TabularInline):
    model = WorkPhilosophySlot
    extra = 1
    ordering = ['slot_number']


class TechnologyToolInline(admin.TabularInline):
    model = TechnologyTool
    extra = 1
    ordering = ['order']


# Админка для AboutContent с inline моделями
@admin.register(AboutContent)
class AboutContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'order', 'is_active', 'created_at')
    list_filter = ('section', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'content')
    inlines = [EducationItemInline, WorkPhilosophySlotInline, TechnologyToolInline]
    fieldsets = (
        ('Основная информация', {
            'fields': ('section', 'title', 'subtitle', 'content', 'image')
        }),
        ('Дополнительная информация', {
            'fields': ('education_summary', 'workflow_text')
        }),
        ('Настройки', {
            'fields': ('is_active', 'order')
        }),
    )


# Админка для AboutMeta
@admin.register(AboutMeta)
class AboutMetaAdmin(admin.ModelAdmin):
    list_display = ('about_content', 'meta_title')
    search_fields = ('meta_title', 'meta_description')


# Админка для ContactInfo
@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('email', 'phone', 'is_active', 'updated_at')
    list_editable = ('is_active',)
    fields = ('email', 'phone', 'address', 'telegram', 'github', 'linkedin', 'map_embed_code', 'is_active')


# Админка для SiteSettings
@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('key', 'value_type', 'is_active', 'updated_at')
    list_filter = ('value_type', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('key', 'description')
    fields = ('key', 'value', 'value_type', 'description', 'file', 'is_active')


# Админка для ContactMessage
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'status', 'created_at')
    list_filter = ('status', 'is_processed')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at', 'ip_address', 'user_agent')
    fieldsets = (
        ('Информация о сообщении', {
            'fields': ('name', 'email', 'phone', 'subject', 'message')
        }),
        ('Техническая информация', {
            'fields': ('status', 'is_processed', 'ip_address', 'user_agent', 'admin_notes')
        }),
        ('Даты', {
            'fields': ('created_at',)
        }),
    )


# Админка для портфолио
@admin.register(PortfolioCategory)
class PortfolioCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


class PortfolioImageInline(admin.TabularInline):
    model = PortfolioImage
    extra = 1
    ordering = ['order']


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'client', 'package', 'is_featured', 'is_active', 'created_at')
    list_filter = ('category', 'package', 'is_featured', 'is_active')
    list_editable = ('is_featured', 'is_active')
    search_fields = ('title', 'client', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [PortfolioImageInline]
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'slug', 'category', 'package', 'client', 'client_logo')
        }),
        ('Детали проекта', {
            'fields': ('duration', 'geo', 'live_url', 'github_url')
        }),
        ('Контент', {
            'fields': ('description', 'testimonial', 'technologies', 'features')
        }),
        ('Настройки', {
            'fields': ('is_featured', 'is_active', 'order')
        }),
    )


# Админка для решений
@admin.register(SolutionCategory)
class SolutionCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'category_type', 'order', 'is_active', 'created_at')
    list_filter = ('category_type', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


class SolutionImageInline(admin.TabularInline):
    model = SolutionImage
    extra = 1
    ordering = ['order']


@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'delivery_days', 'is_popular', 'is_active', 'created_at')
    list_filter = ('category', 'package_type', 'is_popular', 'is_active')
    list_editable = ('is_popular', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SolutionImageInline]
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'slug', 'category', 'package_type')
        }),
        ('Цена и сроки', {
            'fields': ('price', 'delivery_days')
        }),
        ('Описание', {
            'fields': ('description', 'detailed_description', 'features', 'requirements')
        }),
        ('Мета-информация', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords')
        }),
        ('Настройки', {
            'fields': ('is_new', 'is_popular', 'is_active', 'order')
        }),
    )


# Админка для заказов решений
@admin.register(SolutionOrder)
class SolutionOrderAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'solution', 'customer_name', 'customer_email', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'customer_email', 'uuid')
    readonly_fields = ('uuid', 'created_at', 'updated_at')
    fieldsets = (
        ('Информация о заказе', {
            'fields': ('uuid', 'solution', 'total_amount', 'status')
        }),
        ('Информация о клиенте', {
            'fields': ('customer_name', 'customer_email', 'customer_phone', 'customer_message')
        }),
        ('Заметки', {
            'fields': ('notes',)
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at')
        }),
    )
