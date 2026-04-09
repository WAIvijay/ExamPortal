from django.db import models
from django.core.validators import RegexValidator

phone_validator = RegexValidator(
    regex=r'^\d{10}$',
    message='Phone number must be exactly 10 digits.'
)

class Student(models.Model):
    VERSION_CHOICES = [('A','A'),('B','B'),('C','C'),('D','D')]

    name    = models.CharField(max_length=100)
    school  = models.CharField(max_length=200, blank=True, default='')
    phone   = models.CharField(max_length=10, unique=True, blank=False, default='', validators=[phone_validator])
    version = models.CharField(max_length=1, choices=VERSION_CHOICES, default='A')
    score   = models.IntegerField(default=0)
    rank    = models.IntegerField(null=True, blank=True)
    answers = models.TextField(default='[]', blank=True)
    status  = models.CharField(max_length=10, default='OK', blank=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.name} (Version {self.version}, Score {self.score})"
