from django.db import models

# Create your models here.
class Contact(models.Model):
    name = models.CharField(max_length=512)
    user_id = models.UUIDField()
    email = models.EmailField(blank=True, null=True)
    phone = models.BigIntegerField()
    created_on = models.DateTimeField(auto_now_add=True)
    image = models.TextField(blank=True, null=True)
    category_id = models.IntegerField()
    created_by = models.EmailField(blank=True, null=True)
    updated_on = models.DateTimeField(auto_now_add=True)


class Category(models.Model):
    name = models.CharField(max_length=256)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now_add=True)