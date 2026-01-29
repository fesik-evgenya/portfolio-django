from django import template
from django.utils.safestring import mark_safe
import os

register = template.Library()

@register.simple_tag
def inline_critical_css():
    """Инлайн критических CSS стилей"""
    try:
        css_path = 'static/css/critical.css'
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
                # Минификация на лету
                css_content = css_content.replace('\n', ' ').replace('  ', ' ').strip()
                return mark_safe(f'<style>{css_content}</style>')
    except Exception:
        pass
    return mark_safe('<!-- Critical CSS not found -->')

@register.simple_tag
def async_stylesheet(href):
    """Асинхронная загрузка стилей"""
    return mark_safe(
        f'<link rel="preload" href="{href}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">'
        f'<noscript><link rel="stylesheet" href="{href}"></noscript>'
    )

@register.simple_tag
def lazy_image(src, alt, **kwargs):
    """Lazy loading изображений с разными размерами"""
    class_name = kwargs.get('class', '')
    width = kwargs.get('width', '')
    height = kwargs.get('height', '')

    return mark_safe(f'''
        <img src="{src}" 
             alt="{alt}" 
             class="lazy {class_name}"
             loading="lazy" 
             width="{width}" 
             height="{height}"
             data-src="{src}">
    ''')

@register.filter
def split_css_variables(content):
    """Разделяет CSS переменные для critical CSS"""
    lines = content.split('\n')
    variables = []
    other = []

    for line in lines:
        if line.strip().startswith('--'):
            variables.append(line)
        else:
            other.append(line)

    return {
        'variables': '\n'.join(variables),
        'other': '\n'.join(other)
    }