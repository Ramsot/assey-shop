"""
Management command: seed_catalog
Usage: python manage.py seed_catalog [--clear]

Populates the database with sample categories, collections, and products
for development and staging environments. Safe to re-run (idempotent via
get_or_create). Pass --clear to wipe existing data first.
"""

from django.core.management.base import BaseCommand
from catalog.models import Category, Collection, Product

COLLECTIONS = [
    {
        'key': 'signature',
        'name': 'Signature',
        'caption': 'Everyday refined',
        'title': 'The Signature Edit',
        'description': 'Clean silhouettes in premium vegetable-tanned leather.',
        'sort_order': 1,
    },
    {
        'key': 'evening',
        'name': 'Evening',
        'caption': 'After dark',
        'title': 'Evening Atelier',
        'description': 'Compact clutches and micro bags for curated evenings.',
        'sort_order': 2,
    },
    {
        'key': 'workwear',
        'name': 'Workwear',
        'caption': 'Polished utility',
        'title': 'Workwear Collection',
        'description': 'Structured totes and laptop carriers with interior organisation.',
        'sort_order': 3,
    },
]

PRODUCTS = [
    {
        'sku': 'SIG-001',
        'name': 'Pearl Tote',
        'subtitle': 'Full-grain leather tote, champagne',
        'price': '690.00',
        'material': 'Full-grain leather',
        'size': 'Large',
        'tags': ['new', 'best'],
        'is_featured': True,
        'stock_qty': 12,
        'color_options': [{'name': 'Champagne', 'hex': '#d4b896'}, {'name': 'Ivory', 'hex': '#f5f0e8'}],
        'description': 'A roomy yet refined everyday tote in buttery full-grain leather.',
        'collections': ['signature'],
    },
    {
        'sku': 'SIG-002',
        'name': 'Blossom Saddle',
        'subtitle': 'Saddle bag, blush saffiano',
        'price': '490.00',
        'material': 'Saffiano leather',
        'size': 'Medium',
        'tags': ['new'],
        'is_featured': True,
        'stock_qty': 8,
        'color_options': [{'name': 'Blush', 'hex': '#ebc3bf'}, {'name': 'Mocha', 'hex': '#8b6f5e'}],
        'description': 'Structured saddle silhouette with a polished gold clasp.',
        'collections': ['signature'],
    },
    {
        'sku': 'EVE-001',
        'name': 'Crescent Clutch',
        'subtitle': 'Evening clutch, gold satin',
        'price': '320.00',
        'material': 'Satin with leather trim',
        'size': 'Small',
        'tags': ['best'],
        'is_featured': True,
        'stock_qty': 15,
        'color_options': [{'name': 'Gold', 'hex': '#c9b28a'}, {'name': 'Champagne', 'hex': '#d4b896'}],
        'description': 'A minimal crescent pouch with a magnetic closure and wrist strap.',
        'collections': ['evening'],
    },
    {
        'sku': 'EVE-002',
        'name': 'Micro Baguette',
        'subtitle': 'Micro baguette, ivory patent',
        'price': '280.00',
        'material': 'Patent leather',
        'size': 'Small',
        'tags': [],
        'is_featured': False,
        'stock_qty': 6,
        'color_options': [{'name': 'Ivory', 'hex': '#f5f0e8'}, {'name': 'Blush', 'hex': '#ebc3bf'}],
        'description': 'A compact patent baguette with chain strap for evening carry.',
        'collections': ['evening'],
    },
    {
        'sku': 'WRK-001',
        'name': 'Studio Tote',
        'subtitle': 'Laptop tote, pebbled leather',
        'price': '850.00',
        'material': 'Pebbled leather',
        'size': 'Large',
        'tags': ['new', 'best'],
        'is_featured': True,
        'stock_qty': 10,
        'color_options': [{'name': 'Ink', 'hex': '#1f1b16'}, {'name': 'Champagne', 'hex': '#d4b896'}],
        'description': 'Fits a 15" laptop. Dual interior pockets, antique brass hardware.',
        'collections': ['workwear'],
    },
    {
        'sku': 'WRK-002',
        'name': 'Folio Crossbody',
        'subtitle': 'Structured crossbody, tan leather',
        'price': '420.00',
        'material': 'Vegetable-tanned leather',
        'size': 'Medium',
        'tags': [],
        'is_featured': False,
        'stock_qty': 9,
        'color_options': [{'name': 'Tan', 'hex': '#b08060'}, {'name': 'Ivory', 'hex': '#f5f0e8'}],
        'description': 'Slim structured crossbody with a front zip pocket for cards.',
        'collections': ['workwear', 'signature'],
    },
]


class Command(BaseCommand):
    help = 'Seed the catalog with sample categories, collections, and products.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete all existing catalog data before seeding.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            Product.objects.all().delete()
            Collection.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Existing catalog data cleared.'))

        category, _ = Category.objects.get_or_create(
            slug='handbags',
            defaults={'name': 'Handbags', 'sort_order': 0},
        )

        col_map = {}
        for col_data in COLLECTIONS:
            col, created = Collection.objects.update_or_create(
                key=col_data['key'],
                defaults={k: v for k, v in col_data.items() if k != 'key'},
            )
            col_map[col_data['key']] = col
            self.stdout.write(f"  {'Created' if created else 'Updated'} collection: {col.name}")

        for p_data in PRODUCTS:
            col_keys = p_data.pop('collections', [])
            p_data['category'] = category
            product, created = Product.objects.update_or_create(
                sku=p_data['sku'],
                defaults=p_data,
            )
            product.collections.set([col_map[k] for k in col_keys if k in col_map])
            self.stdout.write(f"  {'Created' if created else 'Updated'} product: {product.name}")

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. {len(PRODUCTS)} products across {len(COLLECTIONS)} collections.'
        ))
