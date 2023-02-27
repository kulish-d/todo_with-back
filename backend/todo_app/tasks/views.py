from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response

from tasks.models import Task
from tasks.serializers import TaskSerializer

class TasksViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = Task.objects.all().order_by('id')
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        pass

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        if pk:
            task = Task.objects.get(id=pk)
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(status=status.HTTP_200_OK)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        Task.objects.exclude(status=request.data['status']).update(status=request.data['status'])
        return Response(status=status.HTTP_200_OK)

        

    def destroy(self, request, pk=None):
        #task = Task.objects.get(id=pk)
        # task.delete()
        if pk:
            Task.objects.get(id=pk).delete()
        else:
            Task.objects.filter(status=True).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
