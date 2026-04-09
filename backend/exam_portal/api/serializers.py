import json
from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()

    def get_answers(self, obj):
        try:
            return json.loads(obj.answers)
        except (json.JSONDecodeError, TypeError):
            return []

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)
        if 'answers' in data:
            internal['answers'] = json.dumps(data['answers']) if isinstance(data['answers'], list) else data['answers']
        return internal

    class Meta:
        model  = Student
        fields = '__all__'
