from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response

from tasks.models import Task
from tasks.serializers import TaskSerializer

class TasksViewSet(viewsets.ViewSet):
    def list(self, request):
        category = request.GET['task_category']
        if category == 'active':
            queryset = Task.objects.filter(status=False)
        elif category == 'completed':
            queryset = Task.objects.filter(status=True)
        else:
            queryset = Task.objects.all()
        queryset = queryset.order_by('id')
        serializer = TaskSerializer(queryset, many=True)
        tasks_data = {
            'all_tasks_count': Task.objects.all().count(),
            'active_tasks_count': Task.objects.filter(status=False).count(),
            'completed_tasks_count': Task.objects.filter(status=True).count() 
        }
        checkbox_all_status = tasks_data['all_tasks_count'] == tasks_data['completed_tasks_count']
        # print(tasks_data, checkbox_all_status)
        return Response({'data': serializer.data, 'tasks_data': tasks_data, 'checkbox_all_status': checkbox_all_status})
    
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
