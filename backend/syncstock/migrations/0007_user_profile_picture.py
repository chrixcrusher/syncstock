# Generated by Django 5.0.7 on 2024-08-23 03:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('syncstock', '0006_stockadjustment_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pictures/'),
        ),
    ]
