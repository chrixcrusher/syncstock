# Generated by Django 5.0.7 on 2024-08-20 12:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('syncstock', '0005_delete_report_alter_stockadjustment_adjustment_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='stockadjustment',
            name='category',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='syncstock.category'),
            preserve_default=False,
        ),
    ]
