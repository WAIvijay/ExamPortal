from django.contrib import admin
from django import forms
from .models import Student

class StudentAdminForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = '__all__'

    def clean_phone(self):
        phone = self.cleaned_data.get('phone', '').strip()
        if not phone.isdigit():
            raise forms.ValidationError('Phone number must contain digits only.')
        if len(phone) != 10:
            raise forms.ValidationError('Phone number must be exactly 10 digits.')
        return phone

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    form          = StudentAdminForm
    list_display  = ('id', 'name', 'school', 'phone', 'version', 'score', 'rank')
    list_filter   = ('version',)
    search_fields = ('name', 'phone', 'school')
    ordering      = ('-score',)
    list_editable = ('name', 'phone', 'school', 'score', 'rank')
    fieldsets = (
        ('Student Info', {
            'fields': ('name', 'school', 'phone', 'version')
        }),
        ('Results', {
            'fields': ('score', 'rank', 'answers')
        }),
    )
