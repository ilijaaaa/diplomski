#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Now run the populate script
with open('populate_db.py', 'r', encoding='utf-8') as f:
    exec(f.read())

