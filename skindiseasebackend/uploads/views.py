from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UploadedFile
from django.core.files.storage import FileSystemStorage

@csrf_exempt  # Disable CSRF validation for this view (not recommended for production)
def upload_file(request):
    if request.method == 'POST' and request.FILES['file']:
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(uploaded_file.name, uploaded_file)
        file_url = fs.url(filename)

        # Optionally, save the file information in the database
        UploadedFile.objects.create(file=uploaded_file)

        return JsonResponse({'message': 'File uploaded successfully', 'file_url': file_url})

    return JsonResponse({'error': 'No file uploaded'}, status=400)
