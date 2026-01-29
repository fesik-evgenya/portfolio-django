# main/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
import json
import logging

logger = logging.getLogger(__name__)


class AdminUser(AbstractUser):
    """Кастомная модель администратора"""
    telegram = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to='global/avatars/', blank=True, null=True)
    is_super_admin = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Администратор'
        verbose_name_plural = 'Администраторы'
        db_table = 'admin_users'

    def __str__(self):
        return self.username


class AboutContent(models.Model):
    SECTION_CHOICES = [
        ('biography', 'Биография'),
        ('philosophy', 'Философия работы'),
        ('technologies', 'Технологии'),
    ]

    section = models.CharField(
        max_length=50,
        choices=SECTION_CHOICES,
        default='biography'
    )
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField()
    image = models.ImageField(upload_to='about/images/', blank=True, null=True)
    education_summary = models.TextField(blank=True, null=True)
    workflow_text = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Контент "Обо мне"'
        verbose_name_plural = 'Контенты "Обо мне"'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['section', 'is_active']),
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return f"{self.get_section_display()}: {self.title}"


class AboutMeta(models.Model):
    about_content = models.OneToOneField(
        AboutContent,
        on_delete=models.CASCADE,
        related_name='meta'
    )
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.TextField(blank=True, null=True)
    og_image = models.ImageField(upload_to='about/meta/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Мета-информация'
        verbose_name_plural = 'Мета-информация'
        db_table = 'about_meta'

    def __str__(self):
        return f"Meta для {self.about_content.title}"


class EducationItem(models.Model):
    about_content = models.ForeignKey(
        AboutContent,
        on_delete=models.CASCADE,
        related_name='education_items'
    )
    text = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Пункт образования'
        verbose_name_plural = 'Пункты образования'
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.text[:50]


class WorkPhilosophySlot(models.Model):
    about_content = models.ForeignKey(
        AboutContent,
        on_delete=models.CASCADE,
        related_name='philosophy_slots'
    )
    slot_number = models.IntegerField()
    title = models.CharField(max_length=100)
    content = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Слот философии работы'
        verbose_name_plural = 'Слоты философии работы'
        ordering = ['slot_number']
        unique_together = ['about_content', 'slot_number']

    def __str__(self):
        return f"Слот {self.slot_number}: {self.title}"


class TechnologyTool(models.Model):
    about_content = models.ForeignKey(
        AboutContent,
        on_delete=models.CASCADE,
        related_name='technology_tools'
    )
    name = models.CharField(max_length=100)
    icon = models.FileField(upload_to='about/technology-icons/')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Технология/инструмент'
        verbose_name_plural = 'Технологии/инструменты'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class ContactInfo(models.Model):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    telegram = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    map_embed_code = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Контактная информация'
        verbose_name_plural = 'Контактная информация'
        db_table = 'contact_info'

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        # Оставляем только одну активную запись
        if self.is_active:
            ContactInfo.objects.filter(is_active=True).update(is_active=False)
        return super().save(*args, **kwargs)


class SiteSettings(models.Model):
    SETTING_TYPES = [
        ('string', 'Строка'),
        ('text', 'Текст'),
        ('integer', 'Число'),
        ('boolean', 'Логическое'),
        ('json', 'JSON'),
        ('file', 'Файл'),
    ]

    key = models.CharField(max_length=50, unique=True, db_index=True)
    value = models.TextField(blank=True, null=True)
    value_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='string')
    description = models.CharField(max_length=200, blank=True, null=True)
    file = models.FileField(upload_to='settings/files/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Настройка сайта'
        verbose_name_plural = 'Настройки сайта'
        db_table = 'site_settings'

    def __str__(self):
        return self.key

    def get_value(self):
        """Получить значение с правильным типом"""
        if self.value_type == 'integer':
            return int(self.value) if self.value else 0
        elif self.value_type == 'boolean':
            return self.value.lower() == 'true' if self.value else False
        elif self.value_type == 'json':
            try:
                return json.loads(self.value) if self.value else {}
            except json.JSONDecodeError:
                return {}
        elif self.value_type == 'file':
            return self.file.url if self.file else None
        else:
            return self.value


# portfolio/models.py
import os
from django.db import models
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator


class PortfolioCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Категория портфолио'
        verbose_name_plural = 'Категории портфолио'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class PortfolioItem(models.Model):
    PACKAGE_CHOICES = [
        ('basic', 'Базовый'),
        ('standard', 'Стандартный'),
        ('premium', 'Премиум'),
        ('custom', 'Индивидуальный'),
    ]

    title = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    category = models.ForeignKey(
        PortfolioCategory,
        on_delete=models.PROTECT,
        related_name='portfolio_items'
    )
    package = models.CharField(max_length=100, choices=PACKAGE_CHOICES)
    duration = models.CharField(max_length=50)
    geo = models.CharField(max_length=100, blank=True, null=True)
    testimonial = models.TextField(blank=True, null=True)
    client = models.CharField(max_length=100)
    client_logo = models.ImageField(
        upload_to='portfolio/client-logos/',
        blank=True,
        null=True
    )
    live_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    description = models.TextField()
    technologies = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Проект портфолио'
        verbose_name_plural = 'Проекты портфолио'
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['is_active', 'is_featured']),
            models.Index(fields=['category', 'is_active']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def main_image(self):
        first_image = self.images.filter(is_main=True).first()
        if not first_image:
            first_image = self.images.filter(is_active=True).first()
        return first_image

    @property
    def gallery_images(self):
        return self.images.filter(is_active=True).order_by('order')


class PortfolioImage(models.Model):
    portfolio_item = models.ForeignKey(
        PortfolioItem,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(
        upload_to='portfolio/images/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'svg'])
        ]
    )
    thumbnail = models.ImageField(
        upload_to='portfolio/thumbnails/',
        blank=True,
        null=True
    )
    alt_text = models.CharField(max_length=200, blank=True, null=True)
    is_main = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Изображение портфолио'
        verbose_name_plural = 'Изображения портфолио'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Изображение {self.id} для {self.portfolio_item.title}"

    def save(self, *args, **kwargs):
        # Если это главное изображение, сбрасываем флаг у других
        if self.is_main and self.is_active:
            PortfolioImage.objects.filter(
                portfolio_item=self.portfolio_item,
                is_main=True
            ).exclude(id=self.id).update(is_main=False)
        super().save(*args, **kwargs)


# solutions/models.py
from django.core.validators import MinValueValidator
import uuid


class SolutionCategory(models.Model):
    CATEGORY_TYPES = [
        ('package', 'Пакет'),
        ('module', 'Модуль'),
    ]

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    category_type = models.CharField(max_length=50, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Категория решений'
        verbose_name_plural = 'Категории решений'
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['category_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.get_category_type_display()}: {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Solution(models.Model):
    PACKAGE_TYPES = [
        ('starter', 'Стартовый'),
        ('business', 'Бизнес'),
        ('enterprise', 'Корпоративный'),
        ('custom', 'Индивидуальный'),
    ]

    name = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    category = models.ForeignKey(
        SolutionCategory,
        on_delete=models.PROTECT,
        related_name='solutions'
    )
    description = models.TextField()
    detailed_description = models.TextField(blank=True, null=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    delivery_days = models.IntegerField(validators=[MinValueValidator(1)])
    package_type = models.CharField(
        max_length=50,
        choices=PACKAGE_TYPES,
        blank=True,
        null=True
    )
    features = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    is_new = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Готовое решение'
        verbose_name_plural = 'Готовые решения'
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['is_active', 'is_popular']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['price']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def main_image(self):
        first_image = self.images.filter(is_main=True).first()
        if not first_image:
            first_image = self.images.filter(is_active=True).first()
        return first_image

    @property
    def display_images(self):
        return self.images.filter(is_active=True).order_by('order')


class SolutionImage(models.Model):
    solution = models.ForeignKey(
        Solution,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(
        upload_to='solutions/images/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'svg'])
        ]
    )
    alt_text = models.CharField(max_length=200, blank=True, null=True)
    is_main = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Изображение решения'
        verbose_name_plural = 'Изображения решений'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Изображение {self.id} для {self.solution.name}"

    def save(self, *args, **kwargs):
        if self.is_main and self.is_active:
            SolutionImage.objects.filter(
                solution=self.solution,
                is_main=True
            ).exclude(id=self.id).update(is_main=False)
        super().save(*args, **kwargs)


class SolutionOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает обработки'),
        ('processing', 'В обработке'),
        ('completed', 'Завершен'),
        ('cancelled', 'Отменен'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    solution = models.ForeignKey(
        Solution,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50, blank=True, null=True)
    customer_message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заказ решения'
        verbose_name_plural = 'Заказы решений'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['customer_email']),
        ]

    def __str__(self):
        return f"Заказ #{self.id} - {self.solution.name}"


# contact/models.py
class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новое'),
        ('read', 'Прочитано'),
        ('replied', 'Отвечено'),
        ('spam', 'Спам'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    subject = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    is_processed = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Сообщение контакта'
        verbose_name_plural = 'Сообщения контакта'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.name} - {self.subject or 'Без темы'}"


# Добавьте в конец models.py

class SolutionFAQ(models.Model):
    solution = models.ForeignKey(
        Solution,
        on_delete=models.CASCADE,
        related_name='faq_items'
    )
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'FAQ решения'
        verbose_name_plural = 'FAQ решений'
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.question[:50]