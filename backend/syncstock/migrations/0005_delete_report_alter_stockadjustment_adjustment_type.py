# Generated by Django 5.0.7 on 2024-08-20 07:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('syncstock', '0004_alter_stockadjustment_product_code_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Report',
        ),
        migrations.AlterField(
            model_name='stockadjustment',
            name='adjustment_type',
            field=models.CharField(choices=[('remove', 'Remove'), ('missing', 'Missing'), ('damage', 'Damage'), ('expired', 'Expired'), ('sold', 'Sold')], max_length=10),
        ),
    ]
