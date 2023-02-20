from rest_framework import viewsets
from rest_framework.response import Response

from tasks.models import Task
from tasks.serializers import TaskSerializer

class TasksViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = Task.objects.all()
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        pass

    def retrieve(self, request, pk=None):
        pass

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass
