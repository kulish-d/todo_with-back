from rest_framework import serializers

from tasks.models import Task

class TaskSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    text = serializers.CharField()
    status = serializers.BooleanField(default=False)
