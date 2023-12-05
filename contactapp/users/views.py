from django.shortcuts import render
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404
import dropbox
import base64
from io import BytesIO
# Create your views here.
from django.conf import settings
import base64
import dropbox
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer
import datetime
class UsersListCreate(APIView):
    serializer_class = UserSerializer
    def get(self, request:Request, *args, **kwargs):
        users = User.objects.all()
        serializer = self.serializer_class(instance=users, many=True)
        response = {
            "message":"User data",
            "data":serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        error_data = {}

        if data['password1'] == data['password2']:
            data['password'] = data['password2']
        else:
            error_data["password"] = "Passwords don't match"

        email_check = User.objects.filter(email__iexact=data['email'].strip()).exists()
        if email_check:
            error_data['email'] = "Email already exists"

        if error_data:
            return Response(data=error_data, status=status.HTTP_400_BAD_REQUEST)

        try:
            access_token = settings.DROP_BOX_KEY
            uploaded_file = request.data.get('image')

            if uploaded_file:  
                email = data['email']
                file_name = uploaded_file.name
                file_content = uploaded_file.read()
                path = f'/users/userprofiles/{email}/{file_name}'

                dbx = dropbox.Dropbox(access_token)
                dbx.files_upload(file_content, path)

                shared_link = dbx.sharing_create_shared_link(path).url

                # Update the user data dictionary with the Dropbox file path
                # Modify the shared link URL if needed (change dl=0 to dl=1)
                shared_link = shared_link.replace('dl=0', 'dl=1')
                data['image'] = shared_link


            serializer = self.serializer_class(data=data)

            if serializer.is_valid():
                serializer.save()

                response = {
                    "message": "User created and file uploaded to Dropbox",
                    "data": serializer.data
                }
                return Response(data=response, status=status.HTTP_201_CREATED)

            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserRetrieveUpdateDestroy(APIView):
    serializer_class = UserSerializer
    def get(self, request:Request, user_id:uuid):
        user = get_object_or_404(User, pk=user_id)
        serializer = self.serializer_class(instance=user)
        response = {
            "message":"user",
            "data":serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)

    def put(self, request:Request, user_id:uuid):
       
        data = request.data.copy()
        errorData = {}

        try:
            access_token = settings.DROP_BOX_KEY
            uploaded_file = request.data.get('image')

            if uploaded_file and isinstance(uploaded_file, str):
                # If 'image' is a string (URL), assume it's already an image path, do nothing
                pass

            elif uploaded_file and hasattr(uploaded_file, 'file'):
                email = data['created_by']
                file_name = uploaded_file.name

                # Read the file content
                file_content = uploaded_file.read()

                # Define Dropbox path for upload
                path = f'/user/userProfiles/{email}/{file_name}'

                # Upload file content to Dropbox
                dbx = dropbox.Dropbox(access_token)
                dbx.files_upload(file_content, path)

                # Construct the shared link for the uploaded file
                shared_link = dbx.sharing_create_shared_link(path).url

                # Update the user data dictionary with the Dropbox file path
                # Modify the shared link URL if needed (change dl=0 to dl=1)
                shared_link = shared_link.replace('dl=0', 'dl=1')
                
                data['image'] = shared_link
                data['updated_on'] = datetime.datetime.now()
            user = get_object_or_404(User, pk=user_id)
            serializer = self.serializer_class(data=data, instance=user)

            if serializer.is_valid():
                serializer.save()

                response = {
                    "message": "user updated and file uploaded to Dropbox",
                    "data": serializer.data
                }
                return Response(data=response, status=status.HTTP_201_CREATED)

            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    def delete(self, request:Request, user_id:uuid):
        user = get_object_or_404(User, pk=user_id)
        user.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginCheck(APIView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        email = data.get('email')
        password = data.get('password')

        # Check if the email exists in the database
        try:
            user = User.objects.get(email__iexact=email.strip())
        except User.DoesNotExist:
            return Response(data={"email": "Email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the provided password matches the user's password
        if user.password != password.strip():
            return Response(data={"password": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)

        # Serialize the user data if needed (based on UserLoginSerializer)
        serializer = self.serializer_class(user)
        response = {
            "id": serializer.data['id'],
            "email":serializer.data['email'],
            'image':serializer.data['image']
        }
        return Response(data=response, status=status.HTTP_200_OK)