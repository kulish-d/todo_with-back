from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from tasks.models import Task
from tasks.serializers import TaskSerializer
from todo_app.settings import TASKS_ON_PAGE

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

        request_page = request.GET.get('number_page')

        paginator = Paginator(queryset, TASKS_ON_PAGE)

        next_page = 1
        previous_page = 1

        try:
            final_data = paginator.page(request_page)
        except PageNotAnInteger:
            final_data = paginator.page(paginator.num_pages)
        except EmptyPage:
            final_data = paginator.page(paginator.num_pages)

        serializer = TaskSerializer(final_data, many=True)

        if final_data.has_next():
            next_page = final_data.next_page_number()
        if final_data.has_previous():
            previous_page = final_data.previous_page_number()

        paginaton = {
            'count_pages': paginator.num_pages,
            'count_elements': paginator.count,
            'page': final_data.number,
            'has_next': final_data.has_next(),
            'next_page': next_page,
            'prev_page': previous_page,
        }

        tasks_data = {
            'all_tasks_count': Task.objects.all().count(),
            'active_tasks_count': Task.objects.filter(status=False).count(),
            'completed_tasks_count': Task.objects.filter(status=True).count() 
        }
        checkbox_all_status = (tasks_data['all_tasks_count'] == tasks_data['completed_tasks_count']
                                    if tasks_data['all_tasks_count'] else False)

        return Response({
            'data': serializer.data,
            'tasks_data': tasks_data,
            'checkbox_all_status': checkbox_all_status,
            'pagination': paginaton,
            },
            status=status.HTTP_200_OK)

    def create(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['patch'], detail=False, url_path=r'check_all/')
    def partial_update_common(self, request):
        Task.objects.exclude(status=request.data['status']).update(status=request.data['status'])
        return Response(status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        task = Task.objects.get(id=pk)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if pk:
            Task.objects.get(id=pk).delete()
        else:
            Task.objects.filter(status=True).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
