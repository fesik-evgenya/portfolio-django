from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from apps.main.models import (
    PortfolioCategory,
    PortfolioItem,
    SolutionCategory,
    Solution,
    AboutContent,
    ContactInfo,
    ContactMessage
)


class StaticViewSitemap(Sitemap):
    priority = 1.0
    changefreq = 'weekly'

    def items(self):
        return [
            'main:index',
            'main:about',
            'main:contact',
            'main:privacy',
            'main:terms',
            'main:sitemap_html',
            'portfolio:portfolio_list',
            'solutions:solution_list',
        ]

    def location(self, item):
        return reverse(item)


class AboutContentSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.7

    def items(self):
        return AboutContent.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('main:about') + f'#{obj.section}'


class PortfolioCategorySitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.8

    def items(self):
        return PortfolioCategory.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.created_at


class PortfolioItemSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.9

    def items(self):
        return PortfolioItem.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        # Предполагается, что у вас есть URL для детального просмотра портфолио
        return reverse('portfolio:portfolio_detail', args=[obj.slug])


class SolutionCategorySitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.8

    def items(self):
        return SolutionCategory.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.created_at


class SolutionSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.9

    def items(self):
        return Solution.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        # Предполагается, что у вас есть URL для детального просмотра решения
        return reverse('solutions:solution_detail', args=[obj.slug])


class ContactInfoSitemap(Sitemap):
    changefreq = 'yearly'
    priority = 0.5

    def items(self):
        return ContactInfo.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('main:contact')


# Общий sitemap, который объединяет все карты сайта
sitemaps = {
    'static': StaticViewSitemap,
    'about': AboutContentSitemap,
    'portfolio_categories': PortfolioCategorySitemap,
    'portfolio_items': PortfolioItemSitemap,
    'solution_categories': SolutionCategorySitemap,
    'solutions': SolutionSitemap,
    'contact': ContactInfoSitemap,
}