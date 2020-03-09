# Generated by Django 2.2.10 on 2020-03-09 14:43

from django.db import migrations



class Migration(migrations.Migration):

    dependencies = [
        ('main', '0040_drop_casecourt_table'),
    ]

    operations = [
        migrations.RunSQL('CREATE TABLE IF NOT EXISTS main_casecourt(oof integer DEFAULT 100)'),
        migrations.RemoveIndex(
            model_name='case',
            name='main_case_case_co_437839_idx',
        ),
        migrations.RemoveField(
            model_name='case',
            name='case_court',
        ),
        migrations.DeleteModel(
            name='CaseCourt',
        ),
    ]
